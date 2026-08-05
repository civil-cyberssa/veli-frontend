import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import styles from "./profile-completion-welcome.module.css"

const message =
  "Bem-vindo! Complete o seu perfil para que possamos nos conhecer melhor"

export function ProfileCompletionWelcome() {
  return (
    <main className={styles.page}>
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <section className={styles.content} aria-labelledby="welcome-title">
        <Image
          src="/logo/logo_white.png"
          width={148}
          height={48}
          alt="Veli"
          priority
          className={styles.logo}
        />

        <div className={styles.copy}>
          <h1 id="welcome-title" className={styles.title} aria-label={message}>
            <span aria-hidden="true">
              {Array.from(message).map((letter, index) => (
                <span
                  className={styles.letter}
                  style={{ "--letter-index": index } as React.CSSProperties}
                  key={`${letter}-${index}`}
                >
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </span>
          </h1>
        </div>

        <div className={styles.actions}>
          <Link href="/profile/edit" className={styles.primaryAction}>
            Seguir
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/home" className={styles.secondaryAction}>
            Preencher depois
          </Link>
        </div>
      </section>
    </main>
  )
}
