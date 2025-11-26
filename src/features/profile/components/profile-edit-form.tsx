"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useStudentProfile } from "../hooks/use-student-profile"
import { formatCPF, formatPhone, formatCEP } from "../utils/format"
import { fetchAddressByCEP as fetchAddress } from "../utils/viacep"
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
} from "lucide-react"
import { toast } from "sonner"

export function ProfileEditForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: studentData, loading: studentLoading, mutate } = useStudentProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loadingCep, setLoadingCep] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
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
  })

  // Preenche o formulário quando os dados são carregados
  useEffect(() => {
    if (studentData?.user) {
      const user = studentData.user
      const profile = studentData.student_profile

      // Converte gênero para M ou F (caso venha texto completo da API)
      let genderValue = user.gender || ""
      if (genderValue.toLowerCase() === "masculino") genderValue = "M"
      if (genderValue.toLowerCase() === "feminino") genderValue = "F"

      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        username: user.username || "",
        cpf: user.cpf || "",
        date_of_birth: user.date_of_birth || "",
        gender: genderValue, // M ou F
        phone: user.phone || "",
        cep: "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
        bio: profile?.bio || "",
      })

      setPreviewUrl(user.profile_pic_url || "")
    }
  }, [studentData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }
    return value
  }

  // Formatar Telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
    }
    return value
  }

  // Formatar CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, "$1-$2")
    }
    return value
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({ ...prev, cpf: formatted }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setFormData(prev => ({ ...prev, cep: formatted }))

    // Remove formatação para buscar
    const cleanCEP = formatted.replace(/\D/g, "")

    // Se tiver 8 dígitos, busca no ViaCEP
    if (cleanCEP.length === 8) {
      await fetchAddressByCEP(cleanCEP)
    }
  }

  const fetchAddressByCEP = async (cep: string) => {
    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error("CEP não encontrado")
        return
      }

      // Preenche automaticamente os campos
      setFormData(prev => ({
        ...prev,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        country: "Brasil",
      }))

      toast.success("Endereço preenchido automaticamente!")
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      toast.error("Erro ao buscar CEP")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.access) {
      toast.error("Sessão inválida. Por favor, faça login novamente.")
      return
    }

    // Validações
    if (!formData.first_name || !formData.last_name) {
      toast.error("Nome e sobrenome são obrigatórios")
      return
    }

    if (!formData.email) {
      toast.error("E-mail é obrigatório")
      return
    }

    setIsSubmitting(true)

    try {
      // Criar FormData para enviar arquivo e dados
      const submitData = new FormData()

      // ENVIAR TODOS OS CAMPOS - mesmo que estejam vazios
      // Campos do usuário
      submitData.append("first_name", formData.first_name)
      submitData.append("last_name", formData.last_name)
      submitData.append("email", formData.email)
      submitData.append("username", formData.username || formData.email.split("@")[0])
      submitData.append("cpf", formData.cpf || "")
      submitData.append("date_of_birth", formData.date_of_birth || "")
      submitData.append("gender", formData.gender || "") // Envia M ou F direto
      submitData.append("phone", formData.phone || "")
      submitData.append("cep", formData.cep || "") // ✅ CEP AGORA É ENVIADO
      submitData.append("country", formData.country || "")
      submitData.append("state", formData.state || "")
      submitData.append("city", formData.city || "")

      // Campo do perfil
      submitData.append("bio", formData.bio || "")

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

      const updatedData = await response.json()

      // Atualiza o cache do SWR com os novos dados
      await mutate(updatedData, false)

      toast.success("Perfil atualizado com sucesso!")

      // Reseta a imagem temporária
      setProfileImage(null)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar perfil")
    } finally {
      setIsSubmitting(false)
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Ex: João"
                    required
                    className="transition-all focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sobrenome *
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Ex: Silva"
                    required
                    className="transition-all focus:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                  className="transition-all focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">
                  Este e-mail será usado para login e notificações
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="transition-all focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento
                  </Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    placeholder="DD/MM/AAAA"
                    className="transition-all focus:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Gênero
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger className="transition-all focus:scale-[1.02]">
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
                <p className="text-xs text-muted-foreground">
                  Selecione o gênero que melhor representa você
                </p>
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
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="transition-all focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">
                  Inclua o DDD da sua região
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  CEP
                  {loadingCep && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
                </Label>
                <Input
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleCEPChange}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={loadingCep}
                  className="transition-all focus:scale-[1.02]"
                />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    País
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Brasil"
                    className="transition-all focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Estado
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="SP"
                    maxLength={2}
                    className="transition-all focus:scale-[1.02] uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="São Paulo"
                    className="transition-all focus:scale-[1.02]"
                  />
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
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Ex: Sou estudante de idiomas, apaixonado por conhecer novas culturas. Atualmente estou focado em melhorar minha fluência em francês..."
                  className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none transition-all focus:scale-[1.01]"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Compartilhe suas motivações e objetivos
                  </p>
                  <p className={`text-xs font-medium ${
                    formData.bio.length > 450 ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {formData.bio.length}/500
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
