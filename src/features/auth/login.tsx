"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { ModeToggle } from "@/components/shared/theme-toggle-mode";
import { useTheme } from "next-themes";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saveCredentials, setSaveCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const publicFigures = [
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/68.jpg",
  ];

  const carouselImages = [
    "https://images.unsplash.com/photo-1562918231-f286de6e3194?q=80&w=1272&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedCredentials = localStorage.getItem("userCredentials");
    const hasLoggedBefore = localStorage.getItem("hasLoggedBefore");

    if (savedCredentials) {
      try {
        const { savedEmail, savedPassword } = JSON.parse(savedCredentials);
        setEmail(savedEmail || "");
        setPassword(savedPassword || "");
        setSaveCredentials(true);
      } catch (error) {
        console.error("Erro ao carregar credenciais:", error);
      }
    }

    setIsFirstLogin(!hasLoggedBefore);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha email e senha.",
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      if (saveCredentials) {
        localStorage.setItem(
          "userCredentials",
          JSON.stringify({
            savedEmail: email,
            savedPassword: password,
          }),
        );
      } else {
        localStorage.removeItem("userCredentials");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        toast.error("Falha na autenticação", {
          description: "Email ou senha incorretos. Por favor, verifique suas informações.",
          position: "top-center",
          duration: 5000,
        });

        console.error("Erro de autenticação:", result?.error);
        setIsLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso!", {
        description: "Você será redirecionado para o sistema.",
        position: "top-center",
        duration: 3000,
      });

      if (isFirstLogin) {
        localStorage.setItem("hasLoggedBefore", "true");
        setTimeout(() => {
          router.replace("/home");
        }, 1500);
      } else {
        router.replace("/home");
      }
    } catch (error) {
      console.error("Erro durante autenticação:", error);
      toast.error("Erro de sistema", {
        description: "Ocorreu um erro durante a autenticação. Por favor, tente novamente.",
        position: "top-center",
        duration: 5000,
      });

      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col lg:flex-row">
      {/* Toggle de tema - fixo no topo direito */}
      <div className="fixed top-4 right-4 z-50 lg:top-6 lg:right-6">
        <ModeToggle />
      </div>

      {/* Seção da imagem - 100% do espaço à esquerda em desktop */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative h-full">
        {carouselImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        
        {/* Overlays de gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Indicadores do carrossel */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75 w-2'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Seção do formulário - responsiva para todos os tamanhos */}
      <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="w-full max-w-md px-6 py-12 sm:px-8 md:px-12">
          <div className="space-y-8">
            {/* Cabeçalho */}
            <div className="text-center space-y-4">
              <img
                src={resolvedTheme === 'light' ? '/logo/logo.png' : '/logo/logo_white.png'}
                className="w-32 h-auto mx-auto mb-6 sm:w-36"
                alt="Logo Veli"
              />

              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Bem-vindo de volta!
              </h2>

              <div className="flex items-center justify-center gap-3">
                <div className="flex -space-x-2">
                  {publicFigures.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`Usuário ${index + 1}`}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-background object-cover"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Junte-se a milhares de estudantes
                </p>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-11 h-11 sm:h-12 bg-muted/50 focus:bg-background transition-all rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <a
                    href="/recuperar-senha"
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-11 pr-11 h-11 sm:h-12 bg-muted/50 focus:bg-background transition-all rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save-credentials"
                  checked={saveCredentials}
                  onCheckedChange={(checked) => setSaveCredentials(checked as boolean)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="save-credentials"
                  className="text-sm font-medium cursor-pointer"
                >
                  Lembrar minhas credenciais
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar na conta
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground leading-relaxed pt-3">
                Ao continuar, você concorda com nossos{" "}
                <a href="/termos" className="text-primary hover:underline font-medium">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="/privacidade" className="text-primary hover:underline font-medium">
                  Política de Privacidade
                </a>
              </p>

              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <a href="/cadastro" className="text-primary hover:underline font-medium">
                    Cadastre-se gratuitamente
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}