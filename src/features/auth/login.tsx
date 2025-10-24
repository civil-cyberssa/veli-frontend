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
    "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
          })
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
          description:
            "Email ou senha incorretos. Por favor, verifique suas informações.",
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
        description:
          "Ocorreu um erro durante a autenticação. Por favor, tente novamente.",
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Toggle de tema - responsivo */}
      <div className="fixed top-3 right-3 z-50 sm:top-4 sm:right-4 lg:top-6 lg:right-6">
        <ModeToggle />
      </div>

      {/* Container principal - ajustes responsivos */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl flex flex-col lg:flex-row rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden bg-card border border-border/50 backdrop-blur-sm">
        {/* Seção do carrossel - oculta em mobile, visível em lg+ */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden min-h-[500px] xl:min-h-[600px]">
          {carouselImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
        </div>

        {/* Seção do formulário - totalmente responsiva */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-gradient-to-br from-background to-muted/30">
          <div className="w-full max-w-sm space-y-6 sm:space-y-7 md:space-y-8">
            {/* Cabeçalho - ajustes responsivos */}
            <div className="text-center space-y-3 sm:space-y-4">
              <img
                src={
                  resolvedTheme === "light"
                    ? "/logo/logo.png"
                    : "/logo/logo_white.png"
                }
                className="w-20 h-auto mx-auto mb-4 sm:w-24 sm:mb-5 md:w-28 md:mb-6 lg:w-32 xl:w-36 transition-all"
                alt="Logo Veli"
              />

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Bem-vindo de volta!
              </h2>

              {/* Avatares e texto - melhor espaçamento */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                <div className="flex -space-x-2">
                  {publicFigures.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`Usuário ${index + 1}`}
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full ring-2 ring-background object-cover transition-transform hover:scale-110 hover:z-10"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Junte-se a milhares de estudantes
                </p>
              </div>
            </div>

            {/* Formulário - espaçamentos otimizados */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Campo de email */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs sm:text-sm font-semibold text-foreground"
                >
                  E-mail
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base bg-muted/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all rounded-lg sm:rounded-xl"
                  />
                </div>
              </div>

              {/* Campo de senha */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs sm:text-sm font-semibold text-foreground"
                  >
                    Senha
                  </Label>
                  <a
                    href="/recuperar-senha"
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Esqueceu?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 text-sm sm:text-base bg-muted/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all rounded-lg sm:rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox - melhor touch target */}
              <div className="flex items-center space-x-2 py-0.5 sm:py-1">
                <Checkbox
                  id="save-credentials"
                  checked={saveCredentials}
                  onCheckedChange={(checked) =>
                    setSaveCredentials(checked as boolean)
                  }
                  disabled={isLoading}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label
                  htmlFor="save-credentials"
                  className="text-xs sm:text-sm font-medium cursor-pointer select-none leading-tight"
                >
                  Lembrar minhas credenciais
                </Label>
              </div>

              {/* Botão de submit - otimizado */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-lg sm:rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Entrar na conta
                  </>
                )}
              </Button>

              {/* Links legais - texto menor em mobile */}
              <p className="text-[10px] sm:text-xs text-center text-muted-foreground leading-relaxed pt-2 sm:pt-4 px-1 sm:px-2">
                Ao continuar, você concorda com nossos{" "}
                <a
                  href="/termos"
                  className="text-primary hover:underline font-semibold"
                >
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a
                  href="/privacidade"
                  className="text-primary hover:underline font-semibold"
                >
                  Política de Privacidade
                </a>
              </p>

              {/* Link de cadastro */}
              <div className="text-center pt-1 sm:pt-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <a
                    href="/cadastro"
                    className="text-primary hover:underline font-semibold"
                  >
                    Cadastre-se
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