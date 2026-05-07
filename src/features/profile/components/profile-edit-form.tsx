"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogoPulseLoader } from "@/components/shared/logo-loader"
import {
  Camera,
  Save,
  X,
  PencilLine,
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
  Expand,
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
  const [isEditing, setIsEditing] = useState(false)
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false)

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
      street: "",
      address_number: "",
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

  const syncFormWithStudentData = useCallback(() => {
    if (!studentData?.user) return

    const user = studentData.user
    const profile = studentData.student_profile

    let genderValue = user.gender || ""
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
      genderValue = normalized.charAt(0).toUpperCase()
    }

    let dateValue = ""
    if (user.date_of_birth) {
      const isoMatch = user.date_of_birth.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (isoMatch) {
        dateValue = `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`
      } else {
        dateValue = user.date_of_birth
      }
    }

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
      street: user.street || "",
      address_number: user.address_number || "",
      country: user.country || "",
      state: user.state || "",
      city: user.city || "",
      bio: profile?.bio || "",
    })

    setPreviewUrl(user.profile_pic_url || "")
  }, [reset, studentData])

  // Preenche o formulário quando os dados são carregados
  useEffect(() => {
    syncFormWithStudentData()
  }, [syncFormWithStudentData])

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
      if (data.logradouro) setValue("street", data.logradouro)
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
        street: 'Rua',
        address_number: 'Número',
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
        street: data.street || "",
        address_number: data.address_number || "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        bio: data.bio || "",
      }

      const currentData = {
        first_name: studentData?.user.first_name || "",
        last_name: studentData?.user.last_name || "",
        email: studentData?.user.email || "",
        username: studentData?.user.username || "",
        cpf: studentData?.user.cpf ? cleanCPF(studentData.user.cpf) : "",
        date_of_birth: studentData?.user.date_of_birth
          ? cleanDate(studentData.user.date_of_birth)
          : "",
        gender: studentData?.user.gender || "",
        phone: studentData?.user.phone ? cleanPhone(studentData.user.phone) : "",
        cep: studentData?.user.cep ? cleanCEP(studentData.user.cep) : "",
        street: studentData?.user.street || "",
        address_number: studentData?.user.address_number || "",
        country: studentData?.user.country || "",
        state: studentData?.user.state || "",
        city: studentData?.user.city || "",
        bio: studentData?.student_profile?.bio || "",
      }

      // Criar FormData para enviar arquivo e dados
      const submitData = new FormData()
      let hasChanges = false

      const changedEntries = Object.entries(cleanedData).filter(([key, value]) => {
        return value !== currentData[key as keyof typeof currentData]
      })

      changedEntries.forEach(([key, value]) => {
        submitData.append(key, value)
        hasChanges = true
      })

      // Adicionar imagem se houver
      if (profileImage) {
        submitData.append("profile_pic", profileImage)
        hasChanges = true
      }

      if (!hasChanges) {
        toast.success("Nenhuma alteração para salvar", {
          description: "Seus dados já estão atualizados"
        })
        setIsEditing(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-portal/student/`, {
        method: "PATCH",
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
      setIsEditing(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar perfil"
      toast.error("Falha ao salvar", {
        description: errorMessage,
        duration: 5000
      })
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      syncFormWithStudentData()
      setProfileImage(null)
      setIsEditing(false)
      return
    }

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
  const languages = studentData?.student_profile?.languages ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant={isEditing ? "secondary" : "default"}
            onClick={() => setIsEditing((current) => !current)}
            className="h-11 min-w-[180px] rounded-full px-6 shadow-sm"
          >
            <PencilLine className="mr-2 h-4 w-4" />
            {isEditing ? "Editando usuário" : "Editar usuário"}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/20 shadow-sm">
            <CardContent className="grid gap-8 p-6 md:grid-cols-[220px_1fr] md:p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-2 shadow-lg">
                    <Avatar className="h-36 w-36 rounded-full border-4 border-background shadow-xl">
                      <AvatarImage src={previewUrl} alt={fullName} />
                      <AvatarFallback className="rounded-full bg-primary/10 text-3xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        fileInputRef.current?.click()
                        return
                      }

                      if (previewUrl) {
                        setIsPhotoViewerOpen(true)
                      }
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/55 opacity-0 transition-all duration-200 group-hover:opacity-100 disabled:pointer-events-none"
                    title={isEditing ? "Clique para alterar foto" : "Ver foto"}
                  >
                    {isEditing ? (
                      <>
                        <Camera className="mb-1 h-8 w-8 text-white" />
                        <span className="text-xs font-medium text-white">Alterar foto</span>
                      </>
                    ) : (
                      <>
                        <Expand className="mb-1 h-8 w-8 text-white" />
                        <span className="text-xs font-medium text-white">Ver foto</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={!isEditing}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xl font-semibold">{fullName}</p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {formData.email || "sem email"}
                  </p>
                </div>

                {isEditing && (
                  <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-center text-xs text-muted-foreground shadow-sm">
                    PNG, JPG ou GIF
                    <br />
                    tamanho máximo de 5MB
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight">Apresentação</h2>
                  </div>
                  <textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Ex: Sou estudante de idiomas, apaixonado por conhecer novas culturas. Atualmente estou focado em melhorar minha fluência em francês..."
                    disabled={!isEditing}
                    className={`flex min-h-[150px] w-full resize-none rounded-2xl border border-input bg-background/90 px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-100 md:text-sm ${errors.bio ? 'border-destructive' : ''}`}
                    maxLength={500}
                  />
                  {isEditing && (
                    <div className="flex items-center justify-between">
                      {errors.bio ? (
                        <p className="flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {errors.bio.message}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Resuma seus interesses, objetivos e momento atual nos estudos.
                        </p>
                      )}
                      <p className={`text-xs font-medium ${
                        (formData.bio?.length || 0) > 450 ? "text-destructive" : "text-muted-foreground"
                      }`}>
                        {formData.bio?.length || 0}/500
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight">Idiomas</h2>
                  </div>
                  <div className="flex min-h-16 flex-wrap gap-2">
                    {languages.length > 0 ? (
                      languages.map((language) => (
                        <Badge
                          key={language.id}
                          variant="secondary"
                          className="flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-2 text-sm text-foreground shadow-sm"
                        >
                          {language.lang_icon && (
                            <Image
                              src={language.lang_icon}
                              alt={language.name}
                              width={20}
                              height={20}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          )}
                          <span className="font-medium text-foreground">{language.name}</span>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum idioma cadastrado no momento.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-2xl border border-border/60 bg-muted/50 p-1">
              <TabsTrigger value="personal" className="rounded-xl px-4 py-2.5">
                <User className="h-4 w-4" />
                Informações Pessoais
              </TabsTrigger>
              <TabsTrigger value="contact" className="rounded-xl px-4 py-2.5">
                <MapPin className="h-4 w-4" />
                Endereço
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-0">
              <Card className="border-2 transition-colors hover:border-primary/30">
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
                  <fieldset disabled={!isEditing} className="space-y-4 disabled:opacity-100">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Primeiro Nome *
                        </Label>
                        <Input
                          id="first_name"
                          {...register("first_name")}
                          placeholder="Ex: João"
                          className={`transition-all ${errors.first_name ? 'border-destructive' : ''}`}
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
                          className={`transition-all ${errors.last_name ? 'border-destructive' : ''}`}
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
                        className={`transition-all ${errors.email ? 'border-destructive' : ''}`}
                      />
                      {errors.email ? (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email.message}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Este e-mail será usado para login e notificações.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          className={`transition-all ${errors.cpf ? 'border-destructive' : ''}`}
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
                          className={`transition-all ${errors.date_of_birth ? 'border-destructive' : ''}`}
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
                          className={`transition-all ${phoneCountryFlag ? 'pl-10' : ''} ${errors.phone ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.phone ? (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone.message}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Inclua o DDD da sua região.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Gênero
                      </Label>
                      <select
                        id="gender"
                        {...register("gender")}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-100 ${errors.gender ? 'border-destructive' : ''}`}
                      >
                        <option value="">Selecione seu gênero</option>
                        <option value="M">♂ Masculino</option>
                        <option value="F">♀ Feminino</option>
                        <option value="N">⚧ Não-binário</option>
                        <option value="O">◯ Outro</option>
                        <option value="U">🔒 Prefiro não dizer</option>
                      </select>
                      {errors.gender && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.gender.message}
                        </p>
                      )}
                    </div>
                  </fieldset>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-0">
              <Card className="border-2 transition-colors hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle>Endereço</CardTitle>
                  </div>
                  <CardDescription>
                    Dados de endereço. Use o CEP para preencher automaticamente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <fieldset disabled={!isEditing} className="space-y-4 disabled:opacity-100">
                    <div className="space-y-2">
                      <Label htmlFor="cep" className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        CEP
                        {loadingCep && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
                      </Label>
                      <Input
                        id="cep"
                        {...register("cep")}
                        onChange={handleCEPChange}
                        placeholder="00000-000"
                        maxLength={9}
                        disabled={loadingCep || !isEditing}
                        className={`transition-all ${errors.cep ? 'border-destructive' : ''}`}
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
                            "Digite o CEP para preencher cidade, estado e país automaticamente."
                          )}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px]">
                      <div className="space-y-2">
                        <Label htmlFor="street" className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Rua
                        </Label>
                        <Input
                          id="street"
                          {...register("street")}
                          placeholder="Ex: Avenida Paulista"
                          className={`transition-all ${errors.street ? 'border-destructive' : ''}`}
                        />
                        {errors.street && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.street.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address_number" className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Número
                        </Label>
                        <Input
                          id="address_number"
                          {...register("address_number")}
                          placeholder="Ex: 100"
                          className={`transition-all ${errors.address_number ? 'border-destructive' : ''}`}
                        />
                        {errors.address_number && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.address_number.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                              className={`transition-all ${errors.country ? 'border-destructive' : ''}`}
                              maxLength={50}
                              disabled={!isEditing}
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
                              className={`transition-all uppercase ${errors.state ? 'border-destructive' : ''}`}
                              maxLength={2}
                              countryCode="BR"
                              disabled={!isEditing}
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
                            Sigla do estado, como SP, RJ ou MG.
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
                              className={`transition-all ${errors.city ? 'border-destructive' : ''}`}
                              maxLength={50}
                              countryCode="BR"
                              disabled={!isEditing}
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
                  </fieldset>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botões de Ação */}
          {isEditing && (
            <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 pb-4 pt-6 backdrop-blur-sm md:-mx-6 md:px-6">
              <div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar edição
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-w-[200px] bg-primary hover:bg-primary/90 md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando alterações...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      <Dialog open={isPhotoViewerOpen} onOpenChange={setIsPhotoViewerOpen}>
        <DialogContent className="max-w-[min(92vw,760px)] border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Visualizar foto de perfil</DialogTitle>
          <div className="overflow-hidden rounded-[28px] bg-black/90 shadow-2xl ring-1 ring-white/10">
            <div className="relative aspect-[4/5] w-full bg-black">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={fullName}
                  fill
                  className="object-contain"
                  sizes="92vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Avatar className="h-44 w-44 rounded-full border border-white/10">
                    <AvatarFallback className="rounded-full bg-white/10 text-5xl text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
