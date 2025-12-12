"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useStudentProfile } from "../hooks/use-student-profile"
import { formatCPF, formatPhone, formatCEP, formatDate, cleanCPF, cleanPhone, cleanCEP, cleanDate } from "../utils/format"
import { fetchAddressByCEP } from "../utils/viacep"
import { profileFormSchema, type ProfileFormData } from "../schemas/profile-schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"
import {
  ArrowLeft,
  Camera,
  Save,
  X,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Globe,
  Languages,
  Home,
  Search,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { LocationAutocomplete } from "./location-autocomplete"

const getFlagEmoji = (country?: string) => {
  if (!country) return ""

  const normalized = country.trim().toUpperCase()
  const mapped =
    normalized === "BRASIL" || normalized === "BRAZIL"
      ? "BR"
      : normalized === "PORTUGAL"
        ? "PT"
        : normalized.length === 2
          ? normalized
          : ""

  if (!mapped) return ""

  const codePoints = mapped
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))

  return String.fromCodePoint(...codePoints)
}

export function ProfileEditForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: studentData, loading: studentLoading, mutate } = useStudentProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loadingCep, setLoadingCep] = useState(false)

  // React Hook Form with Zod validation
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      cpf: "",
      date_of_birth: "",
      gender: "",
      phone: "",
      cep: "",
      country: "",
      state: "",
      city: "",
      bio: "",
    },
  })

  // Watch form values for display purposes
  const formData = watch()
  const { errors, isSubmitting } = formState

  const phoneCountryFlag = useMemo(
    () => getFlagEmoji(formData.country || studentData?.user?.country),
    [formData.country, studentData?.user?.country]
  )

  // Preenche o formulário quando os dados são carregados
  useEffect(() => {
    if (studentData?.user) {
      const user = studentData.user
      const profile = studentData.student_profile

      // Converte gênero para o código apropriado (caso venha texto completo da API)
      let genderValue = user.gender || ""

      // Normaliza removendo espaços e convertendo para lowercase
      const normalized = genderValue.trim().toLowerCase()

      if (normalized === "masculino" || normalized === "m") {
        genderValue = "M"
      } else if (normalized === "feminino" || normalized === "f") {
        genderValue = "F"
      } else if (normalized === "não-binário" || normalized === "nao-binario" || normalized === "não binário" || normalized === "nao binario" || normalized === "n") {
        genderValue = "N"
      } else if (normalized === "outro" || normalized === "o") {
        genderValue = "O"
      } else if (normalized === "prefiro não dizer" || normalized === "prefiro nao dizer" || normalized === "u") {
        genderValue = "U"
      } else if (normalized === "") {
        genderValue = ""
      } else {
        // Se não reconhecer, tenta pegar primeira letra maiúscula
        genderValue = normalized.charAt(0).toUpperCase()
      }

      // Converte data para DD/MM/YYYY para exibição (aceita YYYY-MM-DD ou DD/MM/YYYY da API)
      let dateValue = ""
      if (user.date_of_birth) {
        // Tenta formato YYYY-MM-DD
        const isoMatch = user.date_of_birth.match(/^(\d{4})-(\d{2})-(\d{2})$/)
        if (isoMatch) {
          dateValue = `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`
        } else {
          // Já está em DD/MM/YYYY ou outro formato, usa como está
          dateValue = user.date_of_birth
        }
      }

      // Usa reset para preencher todos os campos de uma vez
      // Isso garante que o defaultValue seja atualizado corretamente
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        username: user.username || "",
        cpf: user.cpf ? formatCPF(user.cpf) : "",
        date_of_birth: dateValue,
        gender: genderValue,
        phone: user.phone ? formatPhone(user.phone) : "",
        cep: user.cep ? formatCEP(user.cep) : "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
        bio: profile?.bio || "",
      })

      setPreviewUrl(user.profile_pic_url || "")
    }
  }, [studentData, reset])

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setValue("cpf", formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue("phone", formatted)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value)
    setValue("date_of_birth", formatted)
  }

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setValue("cep", formatted)

    // Remove formatação para buscar
    const cleanCEP = formatted.replace(/\D/g, "")

    // Se tiver 8 dígitos, busca no ViaCEP
    if (cleanCEP.length === 8) {
      await handleFetchAddress(cleanCEP)
    }
  }

  const handleFetchAddress = async (cep: string) => {
    setLoadingCep(true)
    try {
      const data = await fetchAddressByCEP(cep)

      // Preenche automaticamente os campos
      if (data.localidade) setValue("city", data.localidade)
      if (data.uf) setValue("state", data.uf)
      setValue("country", "Brasil")

      toast.success("Endereço encontrado", {
        description: `${data.localidade} - ${data.uf}, Brasil`
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao buscar CEP")
    } finally {
      setLoadingCep(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande", {
          description: "O tamanho máximo permitido é 5MB"
        })
        return
      }

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        toast.error("Formato inválido", {
          description: "Por favor, selecione uma imagem (PNG, JPG ou GIF)"
        })
        return
      }

      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      toast.success("Foto atualizada", {
        description: "Sua foto de perfil foi carregada com sucesso"
      })
    }
  }

  const onError = (errors: typeof formState.errors) => {
    // Mostra toast com resumo dos erros
    const errorCount = Object.keys(errors).length
    const firstError = Object.entries(errors)[0]

    if (firstError) {
      const [field, error] = firstError
      const fieldNames: Record<string, string> = {
        first_name: 'Nome',
        last_name: 'Sobrenome',
        email: 'E-mail',
        cpf: 'CPF',
        phone: 'Telefone',
        cep: 'CEP',
        date_of_birth: 'Data de Nascimento',
        gender: 'Gênero',
        bio: 'Biografia',
        country: 'País',
        state: 'Estado',
        city: 'Cidade',
      }

      const fieldName = fieldNames[field] || field
      const errorMessage = error?.message || 'Erro de validação'

      toast.error(`${fieldName}: ${errorMessage}`, {
        description: errorCount > 1 ? `E mais ${errorCount - 1} erro${errorCount > 2 ? 's' : ''} encontrado${errorCount > 2 ? 's' : ''}` : undefined,
        duration: 5000
      })
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.access) {
      toast.error("Sessão expirada", {
        description: "Por favor, faça login novamente para continuar"
      })
      return
    }

    try {
      // Limpar formatação dos campos antes de enviar
      const cleanedData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        username: data.username || data.email.split("@")[0],
        cpf: data.cpf ? cleanCPF(data.cpf) : "",
        date_of_birth: data.date_of_birth ? cleanDate(data.date_of_birth) : "",
        gender: data.gender || "",
        phone: data.phone ? cleanPhone(data.phone) : "",
        cep: data.cep ? cleanCEP(data.cep) : "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        bio: data.bio || "",
      }

      // Criar FormData para enviar arquivo e dados
      const submitData = new FormData()

      // ENVIAR TODOS OS CAMPOS - limpos e sem formatação
      submitData.append("first_name", cleanedData.first_name)
      submitData.append("last_name", cleanedData.last_name)
      submitData.append("email", cleanedData.email)
      submitData.append("username", cleanedData.username)
      submitData.append("cpf", cleanedData.cpf)
      submitData.append("date_of_birth", cleanedData.date_of_birth)
      submitData.append("gender", cleanedData.gender)
      submitData.append("phone", cleanedData.phone)
      submitData.append("cep", cleanedData.cep)
      submitData.append("country", cleanedData.country)
      submitData.append("state", cleanedData.state)
      submitData.append("city", cleanedData.city)

      // Campo do perfil
      submitData.append("bio", data.bio || "")

      // Adicionar imagem se houver
      if (profileImage) {
        submitData.append("profile_pic", profileImage)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-portal/student/`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${session.access}`,
        },
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Erro ao atualizar perfil")
      }

      await response.json()

      // Revalida o cache do SWR para buscar dados atualizados
      mutate()

      toast.success("Perfil atualizado!", {
        description: "Suas informações foram salvas com sucesso"
      })

      // Reseta a imagem temporária
      setProfileImage(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar perfil"
      toast.error("Falha ao salvar", {
        description: errorMessage,
        duration: 5000
      })
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (studentLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LogoPulseLoader label="Carregando suas informações..." />
      </div>
    )
  }

  const fullName = `${formData.first_name} ${formData.last_name}`.trim() || "Usuário"
  const initials = (formData.first_name?.[0] || "") + (formData.last_name?.[0] || "") || "U"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="rounded-full hover:bg-accent"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Editar Perfil</h1>
            <p className="text-sm text-muted-foreground">
              Atualize suas informações pessoais e preferências
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Foto de Perfil */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <CardTitle>Foto de Perfil</CardTitle>
              </div>
              <CardDescription>
                Escolha uma foto que represente você. Clique na imagem para alterá-la.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-28 w-28 rounded-2xl ring-4 ring-background shadow-lg">
                  <AvatarImage src={previewUrl} alt={fullName} />
                  <AvatarFallback className="rounded-2xl text-2xl bg-primary/10">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Clique para alterar foto"
                >
                  <Camera className="h-8 w-8 text-white mb-1" />
                  <span className="text-xs text-white font-medium">Alterar foto</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-lg font-semibold">{fullName}</p>
                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {formData.email || "sem email"}
                </p>
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Formatos aceitos:</strong> PNG, JPG, GIF
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Tamanho máximo:</strong> 5MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Informações Pessoais</CardTitle>
              </div>
              <CardDescription>
                Dados básicos de identificação. Campos com * são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Primeiro Nome *
                  </Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    placeholder="Ex: João"
                    className={`transition-all focus:scale-[1.02] ${errors.first_name ? 'border-destructive' : ''}`}
                  />
                  {errors.first_name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sobrenome *
                  </Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    placeholder="Ex: Silva"
                    className={`transition-all focus:scale-[1.02] ${errors.last_name ? 'border-destructive' : ''}`}
                  />
                  {errors.last_name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="seu@email.com"
                  className={`transition-all focus:scale-[1.02] ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Este e-mail será usado para login e notificações
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    {...register("cpf")}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`transition-all focus:scale-[1.02] ${errors.cpf ? 'border-destructive' : ''}`}
                  />
                  {errors.cpf && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.cpf.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento
                  </Label>
                  <Input
                    id="date_of_birth"
                    {...register("date_of_birth")}
                    onChange={handleDateChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className={`transition-all focus:scale-[1.02] ${errors.date_of_birth ? 'border-destructive' : ''}`}
                  />
                  {errors.date_of_birth && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Gênero
                </Label>
                <select
                  id="gender"
                  {...register("gender")}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:scale-[1.02] ${errors.gender ? 'border-destructive' : ''}`}
                >
                  <option value="">Selecione seu gênero</option>
                  <option value="M">♂ Masculino</option>
                  <option value="F">♀ Feminino</option>
                  <option value="N">⚧ Não-binário</option>
                  <option value="O">◯ Outro</option>
                  <option value="U">🔒 Prefiro não dizer</option>
                </select>
                {errors.gender ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.gender.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Selecione o gênero que melhor representa você
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contato e Localização */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle>Contato e Localização</CardTitle>
              </div>
              <CardDescription>
                Informações de contato e endereço. Use o CEP para preencher automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                  {phoneCountryFlag && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      <span className="text-base leading-none">{phoneCountryFlag}</span>
                      <span className="max-w-[120px] truncate">
                        {formData.country || studentData?.user?.country}
                      </span>
                    </span>
                  )}
                </Label>
                <div className="relative">
                  {phoneCountryFlag && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                      {phoneCountryFlag}
                    </span>
                  )}
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={`transition-all focus:scale-[1.02] ${phoneCountryFlag ? 'pl-10' : ''} ${errors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Inclua o DDD da sua região
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  CEP
                  {loadingCep && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
                </Label>
                <Input
                  id="cep"
                  {...register("cep")}
                  onChange={handleCEPChange}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={loadingCep}
                  className={`transition-all focus:scale-[1.02] ${errors.cep ? 'border-destructive' : ''}`}
                />
                {errors.cep ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cep.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {loadingCep ? (
                      <span className="flex items-center gap-1 text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Buscando endereço...
                      </span>
                    ) : (
                      "Digite o CEP para preencher cidade, estado e país automaticamente"
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    País
                  </Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <LocationAutocomplete
                        type="country"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Digite para buscar países"
                        className={`transition-all focus:scale-[1.02] ${errors.country ? 'border-destructive' : ''}`}
                        maxLength={50}
                      />
                    )}
                  />
                  {errors.country && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.country.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Estado
                  </Label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <LocationAutocomplete
                        type="state"
                        value={field.value || ""}
                        onChange={(value) => field.onChange(value.toUpperCase())}
                        placeholder="Digite ou selecione o estado"
                        className={`transition-all focus:scale-[1.02] uppercase ${errors.state ? 'border-destructive' : ''}`}
                        maxLength={2}
                        countryCode="BR"
                      />
                    )}
                  />
                  {errors.state ? (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.state.message}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Sigla do estado (ex: SP, RJ, MG)
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Cidade
                  </Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <LocationAutocomplete
                        type="city"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Digite para buscar cidades"
                        className={`transition-all focus:scale-[1.02] ${errors.city ? 'border-destructive' : ''}`}
                        maxLength={50}
                        countryCode="BR"
                      />
                    )}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Sobre Você</CardTitle>
              </div>
              <CardDescription>
                Conte um pouco sobre você, seus interesses e objetivos de aprendizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Ex: Sou estudante de idiomas, apaixonado por conhecer novas culturas. Atualmente estou focado em melhorar minha fluência em francês..."
                  className={`flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none transition-all focus:scale-[1.01] ${errors.bio ? 'border-destructive' : ''}`}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  {errors.bio ? (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.bio.message}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Compartilhe suas motivações e objetivos
                    </p>
                  )}
                  <p className={`text-xs font-medium ${
                    (formData.bio?.length || 0) > 450 ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {formData.bio?.length || 0}/500
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Idiomas */}
          {studentData?.student_profile?.languages && studentData.student_profile.languages.length > 0 && (
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  <CardTitle>Idiomas de Estudo</CardTitle>
                </div>
                <CardDescription>
                  Idiomas que você está atualmente estudando na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {studentData.student_profile.languages.map((language) => (
                    <Badge
                      key={language.id}
                      variant="secondary"
                      className="px-4 py-2 text-sm flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                    >
                      {language.lang_icon && (
                        <Image
                          src={language.lang_icon}
                          alt={language.name}
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-sm object-cover"
                        />
                      )}
                      <span className="font-medium">{language.name}</span>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Para adicionar ou remover idiomas, entre em contato com o suporte
                </p>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-6 pb-4 -mx-4 px-4 md:-mx-6 md:px-6">
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto min-w-[200px] bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando alterações...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
