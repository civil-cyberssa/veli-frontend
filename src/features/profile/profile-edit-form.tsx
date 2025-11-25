"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useStudentProfile } from "@/features/profile_user/useStudentProfile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Save, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ProfileEditForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: studentData, loading: studentLoading, refetch } = useStudentProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  // Form data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    cpf: "",
    date_of_birth: "",
    gender: "",
    phone: "",
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

      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        cpf: user.cpf || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || "",
        phone: user.phone || "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
        bio: profile.bio || "",
      })

      setPreviewUrl(user.profile_pic_url || "")
    }
  }, [studentData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.access) {
      toast.error("Sessão inválida. Por favor, faça login novamente.")
      return
    }

    setIsSubmitting(true)

    try {
      // Criar FormData para enviar arquivo e dados
      const submitData = new FormData()

      // Adicionar dados do formulário
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value)
        }
      })

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

      toast.success("Perfil atualizado com sucesso!")
      await refetch() // Atualiza os dados do perfil
      router.push("/home")
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const fullName = `${formData.first_name} ${formData.last_name}`.trim() || "Usuário"
  const initials = (formData.first_name?.[0] || "") + (formData.last_name?.[0] || "") || "U"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Editar Perfil</h1>
            <p className="text-muted-foreground">Atualize suas informações pessoais</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Clique na imagem para alterar sua foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 rounded-2xl">
                  <AvatarImage src={previewUrl} alt={fullName} />
                  <AvatarFallback className="rounded-2xl text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG ou GIF (max. 5MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Suas informações básicas e identificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Primeiro Nome *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Digite seu primeiro nome"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Sobrenome *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Digite seu sobrenome"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Input
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  placeholder="Ex: Masculino, Feminino, Outro"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contato e Localização */}
          <Card>
            <CardHeader>
              <CardTitle>Contato e Localização</CardTitle>
              <CardDescription>
                Informações de contato e endereço
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Brasil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="São Paulo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre Você</CardTitle>
              <CardDescription>
                Conte um pouco sobre você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Escreva uma breve descrição sobre você..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.bio.length}/500 caracteres
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Idiomas */}
          {studentData?.student_profile?.languages && studentData.student_profile.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Idiomas</CardTitle>
                <CardDescription>
                  Idiomas que você está estudando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {studentData.student_profile.languages.map((language) => (
                    <Badge
                      key={language.id}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-2"
                    >
                      {language.lang_icon && (
                        <img
                          src={language.lang_icon}
                          alt={language.name}
                          className="h-4 w-4 rounded-sm object-cover"
                        />
                      )}
                      {language.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
