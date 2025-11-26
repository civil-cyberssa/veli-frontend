"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useStudentProfile } from "../hooks/use-student-profile"
import { formatCPF, formatPhone, formatCEP } from "../utils/format"
import { fetchAddressByCEP } from "../utils/viacep"
import { profileFormSchema, type ProfileFormData } from "../schemas/profile-schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

  // Log de erros de validação do Zod (para debugging)
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.group('🔴 Erros de Validação do Formulário')
      Object.entries(errors).forEach(([field, error]) => {
        console.log(`📍 Campo: ${field}`)
        console.log(`   ❌ Erro: ${error?.message || 'Erro desconhecido'}`)
        console.log(`   💡 Valor atual: ${formData[field as keyof typeof formData] || '(vazio)'}`)
        console.log('---')
      })
      console.groupEnd()
    }
  }, [errors, formData])

  // Preenche o formulário quando os dados são carregados
  useEffect(() => {
    if (studentData?.user) {
      const user = studentData.user
      const profile = studentData.student_profile

      // Converte gênero para M ou F (caso venha texto completo da API)
      let genderValue = user.gender || ""

      // Normaliza removendo espaços e convertendo para lowercase
      const normalized = genderValue.trim().toLowerCase()

      if (normalized === "masculino" || normalized === "m") {
        genderValue = "M"
      } else if (normalized === "feminino" || normalized === "f") {
        genderValue = "F"
      } else if (normalized === "") {
        genderValue = ""
      } else {
        // Se não reconhecer, tenta pegar primeira letra maiúscula
        genderValue = normalized.charAt(0).toUpperCase()
      }

      console.log('✅ Gender conversion:', {
        original: user.gender,
        normalized: normalized,
        final: genderValue
      })

      // Preenche o formulário com setValue
      setValue("first_name", user.first_name || "")
      setValue("last_name", user.last_name || "")
      setValue("email", user.email || "")
      setValue("username", user.username || "")
      setValue("cpf", user.cpf || "")
      setValue("date_of_birth", user.date_of_birth || "")
      setValue("gender", genderValue as "M" | "F" | "")
      setValue("phone", user.phone || "")
      setValue("cep", "")
      setValue("country", user.country || "")
      setValue("state", user.state || "")
      setValue("city", user.city || "")
      setValue("bio", profile?.bio || "")

      setPreviewUrl(user.profile_pic_url || "")
    }
  }, [studentData, setValue])

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setValue("cpf", formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue("phone", formatted)
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

      toast.success("Endereço preenchido automaticamente!")
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
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
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida")
        return
      }

      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      toast.success("Imagem carregada com sucesso!")
    }
  }

  const onError = (errors: typeof formState.errors) => {
    console.group('❌ Falha na Validação - Formulário não pode ser enviado')
    console.log(`Total de erros: ${Object.keys(errors).length}`)
    console.log('')
    Object.entries(errors).forEach(([field, error]) => {
      console.log(`📍 ${field}:`, error?.message)
    })
    console.groupEnd()

    // Mostra toast com resumo dos erros
    const errorCount = Object.keys(errors).length
    const firstErrors = Object.entries(errors).slice(0, 3)
    const errorMessages = firstErrors.map(([field, error]) => {
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
      return `• ${fieldNames[field] || field}: ${error?.message}`
    }).join('\n')

    toast.error(
      `${errorCount} erro${errorCount > 1 ? 's' : ''} de validação encontrado${errorCount > 1 ? 's' : ''}:\n\n${errorMessages}${errorCount > 3 ? '\n\n...e mais ' + (errorCount - 3) + ' erro(s)' : ''}`,
      { duration: 6000 }
    )
  }

  const onSubmit = async (data: ProfileFormData) => {
    console.group('✅ Validação aprovada - Enviando formulário')
    console.log('Dados validados pelo Zod:')
    console.table(data)
    console.groupEnd()

    if (!session?.access) {
      toast.error("Sessão inválida. Por favor, faça login novamente.")
      return
    }

    try {
      // Criar FormData para enviar arquivo e dados
      const submitData = new FormData()

      // ENVIAR TODOS OS CAMPOS - mesmo que estejam vazios
      // Campos do usuário
      submitData.append("first_name", data.first_name)
      submitData.append("last_name", data.last_name)
      submitData.append("email", data.email)
      submitData.append("username", data.username || data.email.split("@")[0])
      submitData.append("cpf", data.cpf || "")
      submitData.append("date_of_birth", data.date_of_birth || "")
      submitData.append("gender", data.gender || "") // Envia M ou F direto
      submitData.append("phone", data.phone || "")
      submitData.append("cep", data.cep || "") // ✅ CEP AGORA É ENVIADO
      submitData.append("country", data.country || "")
      submitData.append("state", data.state || "")
      submitData.append("city", data.city || "")

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

      toast.success("Perfil atualizado com sucesso!")

      // Reseta a imagem temporária
      setProfileImage(null)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar perfil")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (studentLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando suas informações...</p>
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
                    placeholder="DD/MM/AAAA"
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
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={`transition-all focus:scale-[1.02] ${errors.gender ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Selecione seu gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-blue-500"
                            >
                              <circle cx="10" cy="14" r="7" />
                              <line x1="14.5" y1="9.5" x2="21" y2="3" />
                              <line x1="17" y1="3" x2="21" y2="3" />
                              <line x1="21" y1="3" x2="21" y2="7" />
                            </svg>
                            <span>Masculino</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="F">
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-pink-500"
                            >
                              <circle cx="12" cy="8" r="7" />
                              <line x1="12" y1="15" x2="12" y2="23" />
                              <line x1="8" y1="19" x2="16" y2="19" />
                            </svg>
                            <span>Feminino</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
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
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className={`transition-all focus:scale-[1.02] ${errors.phone ? 'border-destructive' : ''}`}
                />
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
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="Brasil"
                    className={`transition-all focus:scale-[1.02] ${errors.country ? 'border-destructive' : ''}`}
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
                  <Input
                    id="state"
                    {...register("state")}
                    placeholder="SP"
                    maxLength={2}
                    className={`transition-all focus:scale-[1.02] uppercase ${errors.state ? 'border-destructive' : ''}`}
                  />
                  {errors.state && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.state.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="São Paulo"
                    className={`transition-all focus:scale-[1.02] ${errors.city ? 'border-destructive' : ''}`}
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
                        <img
                          src={language.lang_icon}
                          alt={language.name}
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
