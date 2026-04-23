# Instruções - Menu do Header

## 📋 Visão Geral

Foi criada uma seção completa para gerenciar o menu de navegação do header do site, com suporte a:
- ✅ Menus principais
- ✅ Submenus (nível 1)
- ✅ Submenus aninhados (nível 2, 3, etc.)
- ✅ Edição de nome e link
- ✅ Ativação/desativação de itens
- ✅ Ordenação personalizada

## 🚀 Como Usar

### 1. Acessar o Gerenciador de Menu

Existem duas formas de acessar:

**Opção A - Via Configurações:**
1. Acesse o painel admin: `/admin`
2. Clique em "Configurações" no menu lateral
3. Na seção "SEÇÕES", clique em "Menu Header"
4. Clique no botão "Gerenciar Menu do Header"

**Opção B - Direto:**
1. Acesse diretamente: `/admin/header`

### 2. Criar um Item de Menu

1. Clique no botão "Novo Item"
2. Preencha os campos:
   - **Nome do Item** (obrigatório): Ex: "Sobre", "Serviços", "Contato"
   - **Link (URL)**: Ex: `/sobre`, `/servicos`, `https://...`
     - Deixe vazio se for apenas um agrupador de submenus
   - **Item Pai**: Selecione um item existente para criar um submenu
   - **Ordem**: Número para ordenação (menor = aparece primeiro)
   - **Ativo**: Liga/desliga a visibilidade do item
3. Clique em "Salvar"

### 3. Criar Submenus

Para criar um submenu:
1. Crie primeiro o item principal (ex: "Serviços")
2. Crie um novo item
3. No campo "Item Pai", selecione o item principal
4. Preencha os demais campos
5. Salve

**Exemplo de estrutura:**
```
Serviços (sem link)
  ├─ Acrílico (/servicos/acrilico)
  ├─ Marcenaria (/servicos/marcenaria)
  └─ Comunicação Visual (/servicos/comunicacao-visual)
```

### 4. Criar Submenus Aninhados (Nível 2+)

Para criar submenus dentro de submenus:
1. Crie o item de nível 1 (ex: "Acrílico")
2. Crie um novo item
3. No campo "Item Pai", selecione o item de nível 1
4. Salve

**Exemplo de estrutura aninhada:**
```
Serviços
  └─ Acrílico
      ├─ Displays
      ├─ Totens
      └─ Expositores
```

### 5. Editar um Item

1. Clique no ícone de lápis (✏️) ao lado do item
2. Modifique os campos desejados
3. Clique em "Salvar"

### 6. Deletar um Item

1. Clique no ícone de lixeira (🗑️) ao lado do item
2. Confirme a exclusão
3. **Atenção:** Todos os subitens também serão removidos!

### 7. Expandir/Recolher Submenus

- Clique na seta (▶️ ou ▼) ao lado de um item para expandir/recolher seus subitens
- Isso facilita a visualização de menus complexos

## 🔧 Configuração Inicial

### Executar Migrations

```bash
npx prisma migrate dev
```

### Popular Menu Inicial (Opcional)

Para criar um menu de exemplo:

```bash
npx tsx prisma/seed-header-menu.ts
```

Isso criará:
- Home (/)
- Sobre (/sobre)
- Segmentos (/segmentos)
  - Varejo (/segmentos/varejo)
  - Corporativo (/segmentos/corporativo)
- Portfólio (/portfolio)
- Contato (/contato)

### Atualizar Permissões

```bash
npx tsx prisma/seed-permissions.ts
```

Isso adicionará a permissão `edit_settings_header` para gerenciar o menu.

## 📡 API Endpoints

### Público (Frontend)

**GET /api/header-menu**
- Retorna menu hierárquico (apenas itens ativos)
- Não requer autenticação

```json
[
  {
    "id": 1,
    "label": "Serviços",
    "link": null,
    "order": 1,
    "children": [
      {
        "id": 2,
        "label": "Acrílico",
        "link": "/servicos/acrilico",
        "order": 1,
        "children": []
      }
    ]
  }
]
```

### Admin (Protegido)

**GET /api/header-menu/all**
- Retorna todos os itens (incluindo inativos)
- Requer autenticação

**POST /api/header-menu**
- Cria novo item
- Body: `{ label, link?, parentId?, order?, active? }`

**PUT /api/header-menu/:id**
- Atualiza item existente
- Body: `{ label, link?, parentId?, order?, active? }`

**DELETE /api/header-menu/:id**
- Deleta item e seus filhos
- Requer confirmação

**PUT /api/header-menu/reorder**
- Reordena múltiplos itens
- Body: `{ items: [{ id, order }] }`

## 🎨 Integração no Frontend

Para usar o menu no componente Navbar:

```tsx
import { useState, useEffect } from "react";

interface MenuItem {
  id: number;
  label: string;
  link: string | null;
  children: MenuItem[];
}

function Navbar() {
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch("/api/header-menu")
      .then(res => res.json())
      .then(data => setMenu(data));
  }, []);

  const renderMenu = (items: MenuItem[]) => {
    return items.map(item => (
      <div key={item.id}>
        {item.link ? (
          <a href={item.link}>{item.label}</a>
        ) : (
          <span>{item.label}</span>
        )}
        {item.children.length > 0 && (
          <div className="submenu">
            {renderMenu(item.children)}
          </div>
        )}
      </div>
    ));
  };

  return <nav>{renderMenu(menu)}</nav>;
}
```

## 🔐 Permissões

A permissão `edit_settings_header` controla o acesso à seção de gerenciamento do menu.

Por padrão:
- **SUPER_ADMIN**: Tem acesso total
- **ADMIN**: Precisa ter a permissão atribuída
- **EDITOR**: Precisa ter a permissão atribuída

Para atribuir a permissão:
1. Acesse `/admin/permissoes`
2. Selecione o usuário ou role
3. Marque "Editar Menu Header"
4. Salve

## 📝 Notas Importantes

1. **Hierarquia Ilimitada**: Você pode criar quantos níveis de submenu precisar
2. **Ordenação**: Use números para controlar a ordem (0, 10, 20, etc.)
3. **Links Vazios**: Itens sem link servem como agrupadores de submenus
4. **Itens Inativos**: Não aparecem no frontend, mas ficam salvos no admin
5. **Deleção em Cascata**: Deletar um item remove todos os seus subitens

## 🐛 Troubleshooting

**Menu não aparece no frontend:**
- Verifique se os itens estão marcados como "Ativo"
- Confirme que a API `/api/header-menu` está retornando dados
- Verifique o console do navegador por erros

**Erro ao salvar:**
- Verifique se o nome do item está preenchido
- Confirme que você tem a permissão `edit_settings_header`
- Verifique se não está tentando fazer um item ser pai de si mesmo

**Permissão negada:**
- Peça ao administrador para atribuir a permissão `edit_settings_header`
- Ou execute: `npx tsx prisma/seed-role-permissions.ts`
