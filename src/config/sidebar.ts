export interface SidebarGroup {
  label: string;
  items: {
    label: string;
    slug: string; // The frontmatter slug or fallback filename slug
  }[];
}

export interface SidebarCollectionConfig {
  docs: SidebarGroup[];
}

type SidebarLang = 'en' | 'es';

const sidebarConfigByLang: Record<SidebarLang, SidebarCollectionConfig> = {
  en: {
    docs: [
      {
        label: 'macOS Setup Guide',
        items: [
          { label: '· Introduction', slug: 'macos-setup-guide' },
          { label: '· Base System Setup', slug: 'macos-setup-guide/base-system-setup-macos' },
          { label: '· Terminal Setup', slug: 'macos-setup-guide/terminal-setup-macos' },
          { label: '· SSH & Authentication', slug: 'macos-setup-guide/ssh-and-authentication' },
          { label: '· Git & Version Control', slug: 'macos-setup-guide/git-and-version-control' },
          { label: '· Shell CLI Tooling', slug: 'macos-setup-guide/shell-cli-tooling' },
          { label: '· Shell Usability', slug: 'macos-setup-guide/shell-usability-improvements' },
          { label: '· Prompt & UX', slug: 'macos-setup-guide/prompt-and-ux' },
          { label: '· Secrets & Environment', slug: 'macos-setup-guide/secrets-and-environment-management' },
          { label: '· Python & Automation', slug: 'macos-setup-guide/python-and-automation-tooling' },
          { label: '· Kubernetes & DevOps', slug: 'macos-setup-guide/kubernetes-and-devops-tooling' },
          { label: '· Neovim Setup', slug: 'macos-setup-guide/editor-setup-neovim' },
          { label: '· Dotfiles', slug: 'macos-setup-guide/dotfiles-and-reproducibility' },
        ],
      },
      {
        label: 'Python',
        items: [
          { label: '· Environment with direnv', slug: 'python-environment-direnv' },
          { label: '· Threading & Blocking I/O', slug: 'python-threads-blocking-io' },
          { label: '· In-Process Cache', slug: 'python-inmemory-cache' },
        ],
      },
      {
        label: 'How-To',
        items: [
          { label: '· Create and Delegate a Route 53 Hosted Zone for a Subdomain', slug: 'create-delegated-subdomain-aws-route53-hosted-zone' },
          { label: '· Split Route 53 Hosted Zone into Delegated Subdomains', slug: 'splitting-aws-route53-hosted-zone-into-delegated-subdomains' },
          { label: '· Record Terminal Sessions as SVG with termsvg', slug: 'how-to/recording-terminal-to-svg-with-termsvg' },
        ]
      }
    ],
  },
  es: {
    docs: [
      {
        label: 'Guia de configuracion de macOS',
        items: [
          { label: '· Introduccion', slug: 'macos-setup-guide' },
          { label: '· Configuracion del sistema base', slug: 'macos-setup-guide/base-system-setup-macos' },
          { label: '· Configuracion de terminal', slug: 'macos-setup-guide/terminal-setup-macos' },
          { label: '· SSH y autenticacion', slug: 'macos-setup-guide/ssh-and-authentication' },
          { label: '· Git y control de versiones', slug: 'macos-setup-guide/git-and-version-control' },
          { label: '· Herramientas CLI de shell', slug: 'macos-setup-guide/shell-cli-tooling' },
          { label: '· Usabilidad de la shell', slug: 'macos-setup-guide/shell-usability-improvements' },
          { label: '· Prompt y UX', slug: 'macos-setup-guide/prompt-and-ux' },
          { label: '· Secretos y entorno', slug: 'macos-setup-guide/secrets-and-environment-management' },
          { label: '· Python y automatizacion', slug: 'macos-setup-guide/python-and-automation-tooling' },
          { label: '· Kubernetes y DevOps', slug: 'macos-setup-guide/kubernetes-and-devops-tooling' },
          { label: '· Configuracion de Neovim', slug: 'macos-setup-guide/editor-setup-neovim' },
          { label: '· Dotfiles', slug: 'macos-setup-guide/dotfiles-and-reproducibility' },
        ],
      },
      {
        label: 'Python',
        items: [
          { label: '· Entorno con direnv', slug: 'python-environment-direnv' },
          { label: '· Hilos y E/S bloqueante', slug: 'python-threads-blocking-io' },
          { label: '· Caché en memoria', slug: 'python-inmemory-cache' },
        ],
      },
      {
        label: 'Guias practicas',
        items: [
          { label: '· Crear y delegar una zona hospedada de Route 53 para un subdominio', slug: 'create-delegated-subdomain-aws-route53-hosted-zone' },
          { label: '· Dividir una Hosted Zone de Route 53 en subdominios delegados', slug: 'splitting-aws-route53-hosted-zone-into-delegated-subdomains' },
          { label: '· Grabar sesiones de terminal en SVG con termsvg', slug: 'how-to/recording-terminal-to-svg-with-termsvg' },
        ]
      }
    ],
  },
};

export function getSidebarConfig(lang: string): SidebarCollectionConfig {
  return sidebarConfigByLang[lang === 'es' ? 'es' : 'en'];
}
