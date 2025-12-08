import { modelTypeIcons, Provider } from "@/config/ai";
import { Model } from "@/types/ai/chat";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Model>[] = [
  {
    accessorKey: 'promptType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.promptType;
      if (!type) return null
      const Icon = modelTypeIcons[type]
      return <Icon className="w-4 h-4" />
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
    cell: ({ row }) => {
      return Provider[row.original.provider]
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
];