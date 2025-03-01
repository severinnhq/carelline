import { Truck, RefreshCcw, ShieldCheck } from 'lucide-react'

export function CompactShippingFeatures() {
  return (
    <div className="mt-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <Truck className="h-8 w-8 text-primary stroke-[1.5]" />
          <div>
            <h3 className="text-sm font-medium">Ingyenes szállítás</h3>
            <p className="text-xs text-muted-foreground">30 000FT felett.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <RefreshCcw className="h-8 w-8 text-primary stroke-[1.5]" />
          <div>
            <h3 className="text-sm font-medium">14 napos visszaküldés</h3>
            <p className="text-xs text-muted-foreground">Az átvételtől számítva.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-8 w-8 text-primary stroke-[1.5]" />
          <div>
            <h3 className="text-sm font-medium">Biztonságos fizetés</h3>
            <p className="text-xs text-muted-foreground">100%-os védelem.</p>
          </div>
        </div>
      </div>
    </div>
  )
}