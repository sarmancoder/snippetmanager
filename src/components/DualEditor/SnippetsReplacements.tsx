import React from 'react';
// Importamos el icono desde react-icons (FiChevronDown de Feather Icons)
import { FiChevronDown } from 'react-icons/fi';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  onReplace: (value: string) => void;
}

// Definimos las variables por categorías
const SNIPPET_VARIABLES = [
  {
    label: 'Editor & Archivo',
    variables: [
      { id: 'TM_SELECTED_TEXT', desc: 'Texto seleccionado' },
      { id: 'TM_CURRENT_LINE', desc: 'Línea actual' },
      { id: 'TM_CURRENT_WORD', desc: 'Palabra bajo cursor' },
      { id: 'TM_LINE_INDEX', desc: 'Índice de línea (0)' },
      { id: 'TM_LINE_NUMBER', desc: 'Número de línea (1)' },
      { id: 'TM_FILENAME', desc: 'Nombre archivo' },
      { id: 'TM_FILENAME_BASE', desc: 'Nombre sin extensión' },
      { id: 'TM_DIRECTORY', desc: 'Directorio' },
      { id: 'TM_FILEPATH', desc: 'Ruta completa' },
      { id: 'RELATIVE_FILEPATH', desc: 'Ruta relativa' },
      { id: 'CLIPBOARD', desc: 'Portapapeles' },
    ],
  },
  {
    label: 'Workspace',
    variables: [
      { id: 'WORKSPACE_NAME', desc: 'Nombre workspace' },
      { id: 'WORKSPACE_FOLDER', desc: 'Ruta workspace' },
    ],
  },
  {
    label: 'Cursor',
    variables: [
      { id: 'CURSOR_INDEX', desc: 'Índice cursor (0)' },
      { id: 'CURSOR_NUMBER', desc: 'Número cursor (1)' },
    ],
  },
  {
    label: 'Fecha y Hora',
    variables: [
      { id: 'CURRENT_YEAR', desc: 'Año' },
      { id: 'CURRENT_YEAR_SHORT', desc: 'Año corto' },
      { id: 'CURRENT_MONTH', desc: 'Mes (02)' },
      { id: 'CURRENT_MONTH_NAME', desc: 'Mes nombre' },
      { id: 'CURRENT_DATE', desc: 'Día del mes' },
      { id: 'CURRENT_DAY_NAME', desc: 'Día nombre' },
      { id: 'CURRENT_HOUR', desc: 'Hora (24h)' },
      { id: 'CURRENT_MINUTE', desc: 'Minuto' },
      { id: 'CURRENT_SECOND', desc: 'Segundo' },
      { id: 'CURRENT_TIMEZONE_OFFSET', desc: 'Zona horaria' },
    ],
  },
];

export function SnippetsReplacements({ onReplace }: Props) {
  const handleSelect = (varId: string) => {
    onReplace(`\${${varId}}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ size: 'sm', className: 'gap-1.5' })}>
        Reemplazar
        <FiChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        {SNIPPET_VARIABLES.map((group, idx) => (
          <React.Fragment key={group.label}>
            {idx > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              {group.variables.map((v) => (
                <DropdownMenuItem
                  key={v.id}
                  onClick={() => handleSelect(v.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="font-mono text-xs font-bold">{v.id}</span>
                  <span className="text-xs text-muted-foreground">{v.desc}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}