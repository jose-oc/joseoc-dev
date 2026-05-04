export interface SidebarGroup {
  label: string;
  items: {
    label: string;
    slug: string; // The frontmatter slug or fallback filename slug
  }[];
}

export const sidebarConfig: Record<string, SidebarGroup[]> = {
  docs: [
    {
      label: 'macOS Setup Guide',
      items: [
        { label: 'Introduction', slug: 'macos-setup-guide' },
        { label: 'Base System Setup', slug: 'macos-setup-guide/base-system-setup-macos' },
        { label: 'Terminal Setup', slug: 'macos-setup-guide/terminal-setup-macos' },
        { label: 'SSH & Authentication', slug: 'macos-setup-guide/ssh-and-authentication' },
        { label: 'Git & Version Control', slug: 'macos-setup-guide/git-and-version-control' },
        { label: 'Shell CLI Tooling', slug: 'macos-setup-guide/shell-cli-tooling' },
        { label: 'Shell Usability', slug: 'macos-setup-guide/shell-usability-improvements' },
        { label: 'Prompt & UX', slug: 'macos-setup-guide/prompt-and-ux' },
        { label: 'Secrets & Environment', slug: 'macos-setup-guide/secrets-and-environment-management' },
        { label: 'Python & Automation', slug: 'macos-setup-guide/python-and-automation-tooling' },
        { label: 'Kubernetes & DevOps', slug: 'macos-setup-guide/kubernetes-and-devops-tooling' },
        { label: 'Neovim Setup', slug: 'macos-setup-guide/editor-setup-neovim' },
        { label: 'Dotfiles', slug: 'macos-setup-guide/dotfiles-and-reproducibility' },
      ],
    },
    {
      label: 'Python',
      items: [
        { label: 'Environment with direnv', slug: 'python-environment-direnv' },
      ],
    },
    // {
    //   label: 'Drafts',
    //   items: [
    //     { label: 'Configure DNS', slug: 'configure-dns-servers' },
    //     { label: 'Configure Wifi (LLM Notes)', slug: 'drafts/configure-wifi-llm-notes-draft' },
    //     { label: 'Neovim', slug: 'neovim-value-in-daily-work' },
    //     { label: 'Personal Performance', slug: 'energy-vs-performance' },
    //     { label: 'Tmux', slug: 'tmux' },
    //     { label: 'Virtualization', slug: 'virtualization' },
    //   ]
    // },
    {
      label: 'How-To',
      items: [
        { label: 'Split Route 53 Hosted Zone into Delegated Subdomains', slug: 'splitting-aws-route53-hosted-zone-into-delegated-subdomains' },
      ]
    }
  ],
};
