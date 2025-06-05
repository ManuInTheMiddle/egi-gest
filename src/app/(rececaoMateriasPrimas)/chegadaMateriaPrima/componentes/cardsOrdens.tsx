import React, { useMemo } from "react";
import { format, startOfMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { usePurchaseOrderStats } from "@/Services/OrdensCompra/fetchOrdensCompraStats";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ IMPROVED: Proper TypeScript types
type ColorType = "blue" | "green" | "orange" | "indigo" | "gray";

interface StatCardProps {
  title: string;
  value: number | string;
  color: ColorType;
  icon: string;
  subtitle?: string;
  progress?: number;
  isDate?: boolean;
}

interface CardData {
  title: string;
  value: number | string;
  color: ColorType;
  icon: string;
  subtitle?: string;
  progress?: number;
  isDate?: boolean;
}

// ✅ IMPROVED: Typed color classes
const COLOR_CLASSES: Record<
  ColorType,
  { text: string; bg: string; progress: string }
> = {
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    progress: "bg-blue-500",
  },
  green: {
    text: "text-green-600",
    bg: "bg-green-50 border-green-200",
    progress: "bg-green-500",
  },
  orange: {
    text: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    progress: "bg-orange-500",
  },
  indigo: {
    text: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    progress: "bg-indigo-500",
  },
  gray: {
    text: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    progress: "bg-gray-400",
  },
} as const;

// ✅ IMPROVED: Month names as constant
const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

// ✅ IMPROVED: Reusable StatCard component with proper types
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  color,
  icon,
  subtitle,
  progress,
  isDate = false,
}) => {
  const colorConfig = COLOR_CLASSES[color];

  return (
    <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6 hover:shadow-3xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
        <span className="text-2xl" role="img" aria-label={`${title} icon`}>
          {icon}
        </span>
      </div>

      <dd
        className={`mt-1 text-3xl font-semibold tracking-tight ${
          isDate ? "text-gray-900" : colorConfig.text
        }`}
      >
        {typeof value === "number" && !isDate
          ? value.toLocaleString("pt-PT")
          : value}
      </dd>

      {subtitle && <div className="mt-2 text-sm text-gray-600">{subtitle}</div>}

      {progress !== undefined && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${colorConfig.progress}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ IMPROVED: Loading skeleton component
const LoadingCardsSkeleton: React.FC = () => (
  <div className="flex w-full flex-row justify-around my-10">
    <dl className="mt-5 w-full flex flex-row gap-10 justify-center">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </dl>
  </div>
);

// ✅ IMPROVED: Error state component
const ErrorCardsState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="flex w-full flex-row justify-around my-10">
    <div className="overflow-hidden rounded-lg bg-red-50 border border-red-200 px-5 py-5 shadow-2xl sm:p-6 mx-auto">
      <dt className="text-sm font-medium text-red-600 mb-2">
        ❌ Erro ao carregar dados
      </dt>
      <dd className="text-sm text-red-500 mb-3">
        Não foi possível carregar as estatísticas das ordens
      </dd>
      <button
        onClick={onRetry}
        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        type="button"
      >
        🔄 Tentar novamente
      </button>
    </div>
  </div>
);

// ✅ IMPROVED: Main component with better organization
const CardsOrdens: React.FC = () => {
  const currentMonthStart = useMemo(() => {
    const currentDate = new Date();
    return format(startOfMonth(currentDate), "yyyy-MM-dd");
  }, []);

  // For display purposes - can be recreated each render since it's just for display
  const currentDate = new Date();

  const stats = usePurchaseOrderStats(currentMonthStart);

  // Early returns for loading and error states
  if (stats.isLoading) {
    return <LoadingCardsSkeleton />;
  }

  if (stats.isError) {
    return <ErrorCardsState onRetry={stats.refetchAll} />;
  }

  // ✅ IMPROVED: Memoized card configuration
  const cardConfigs: CardData[] =[
      {
        title: "Ordens Totais",
        value: stats.data.total,
        color: "blue" as ColorType,
        icon: "📋",
        subtitle: "Todas as ordens",
        progress: Math.min(100, (stats.data.total / 1000) * 100),
      },
      {
        title: `Ordens ${MONTH_NAMES[currentDate.getMonth()]}`,
        value: stats.data.total,
        color: "indigo" as ColorType,
        icon: "📅",
        subtitle: `Desde ${format(startOfMonth(currentDate), "dd/MM", {
          locale: pt,
        })}`,
      },
      {
        title: `Ordens Recebidas ${MONTH_NAMES[currentDate.getMonth()]}`,
        value: stats.data.concluidas,
        color: "green" as ColorType,
        icon: "✅",
        subtitle: `${stats.data.percentage}% concluídas`,
        progress: stats.data.percentage,
      },
      {
        title: "Ordens Pendentes",
        value: stats.data.porConcluir,
        color: "orange" as ColorType,
        icon: "⏳",
        subtitle:
          stats.data.porConcluir > 0 ? "Requerem atenção" : "Tudo em dia!",
      },
      {
        title: "Data",
        value: format(currentDate, "dd/MM"),
        color: "gray" as ColorType,
        icon: "🗓️",
        subtitle: format(currentDate, "eeee", { locale: pt }),
        isDate: true,
      },
    ]

  return (
    <div className="flex w-full flex-row justify-around my-10">
      <dl className="mt-5 w-full flex flex-row gap-10 justify-center">
        {cardConfigs.map((card, index) => (
          <StatCard key={`${card.title}-${index}`} {...card} />
        ))}
      </dl>
    </div>
  );
};

// ✅ IMPROVED: Enhanced version with better structure
export const EnhancedCardsOrdens: React.FC = () => {

  const currentDate = new Date();

  const currentMonthStart = useMemo(() => {
    const currentDate = new Date();
    return format(startOfMonth(currentDate), "yyyy-MM-dd");
  }, []);

  const stats = usePurchaseOrderStats(currentMonthStart);

  if (stats.isLoading) {
    return <LoadingCardsSkeleton />;
  }

  if (stats.isError) {
    return <ErrorCardsState onRetry={stats.refetchAll} />;
  }

  // ✅ IMPROVED: Better card structure with individual components
  return (
    <div className="flex w-full flex-row justify-around my-10">
      <dl className="mt-5 w-full flex flex-row gap-10 justify-center">
        {/* Total Orders Card */}
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6 hover:shadow-3xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <dt className="truncate text-sm font-medium text-gray-500">
              Ordens Totais
            </dt>
            <span className="text-2xl">📋</span>
          </div>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-600">
            {stats.data.total.toLocaleString("pt-PT")}
          </dd>
          <div className="mt-2 text-sm text-gray-600">Todas as ordens</div>
          {/* Progress indicator */}
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (stats.data.total / 1000) * 100)}%`,
                }}
                role="progressbar"
                aria-valuenow={Math.min(100, (stats.data.total / 1000) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>

        {/* Monthly Orders Card */}
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6 hover:shadow-3xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <dt className="truncate text-sm font-medium text-gray-500">
              Ordens Mês de {MONTH_NAMES[currentDate.getMonth()]}
            </dt>
            <span className="text-2xl">📅</span>
          </div>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-600">
            {stats.data.total.toLocaleString("pt-PT")}
          </dd>
          <div className="mt-2 text-sm text-gray-600">
            Desde {format(startOfMonth(currentDate), "dd/MM", { locale: pt })}
          </div>
        </div>

        {/* Completed Orders Card */}
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6 hover:shadow-3xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <dt className="truncate text-sm font-medium text-gray-500">
              Ordens Recebidas {MONTH_NAMES[currentDate.getMonth()]}
            </dt>
            <span className="text-2xl">✅</span>
          </div>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
            {stats.data.concluidas.toLocaleString("pt-PT")}
          </dd>
          <div className="mt-2 flex items-center text-sm">
            <span className="font-medium text-green-600">
              {stats.data.percentage}%
            </span>
            <span className="ml-1 text-gray-500">concluídas</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.data.percentage}%` }}
                role="progressbar"
                aria-valuenow={stats.data.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6 hover:shadow-3xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <dt className="truncate text-sm font-medium text-gray-500">
              Ordens Pendentes
            </dt>
            <span className="text-2xl">⏳</span>
          </div>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-orange-600">
            {stats.data.porConcluir.toLocaleString("pt-PT")}
          </dd>
          <div className="mt-2 text-sm text-orange-600">
            {stats.data.porConcluir > 0 ? "Requerem atenção" : "Tudo em dia!"}
          </div>
        </div>

        {/* Date Card */}
        <div className="overflow-hidden rounded-lg bg-white px-5 py-5 shadow-2xl sm:p-6 hover:shadow-3xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <dt className="truncate text-sm font-medium text-gray-500">Data</dt>
            <span className="text-2xl">🗓️</span>
          </div>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {format(currentDate, "dd/MM/yyyy")}
          </dd>
          <div className="mt-2 text-sm text-gray-600">
            {format(currentDate, "eeee", { locale: pt })}
          </div>
        </div>
      </dl>
    </div>
  );
};

export default CardsOrdens;
export { StatCard, LoadingCardsSkeleton, ErrorCardsState };
