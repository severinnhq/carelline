import { Truck, RefreshCcw, ShieldCheck } from 'lucide-react'

export function ShippingFeatures() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="w-full md:w-1/3">
          <div className="flex flex-col items-center text-center p-6">
            <Truck className="h-16 w-16 mb-6 text-primary stroke-[1.5]" />
            <div>
              <h3 className="text-xl font-semibold">Ingyenes szállítás</h3>
              <p className="text-sm text-muted-foreground mt-2">40 000FT felett.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex flex-col items-center text-center p-6">
            <RefreshCcw className="h-16 w-16 mb-6 text-primary stroke-[1.5]" />
            <div>
              <h3 className="text-xl font-semibold">14 napos visszaküldés</h3>
              <p className="text-sm text-muted-foreground mt-2">Az átvételtől számítva.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex flex-col items-center text-center p-6">
            <ShieldCheck className="h-16 w-16 mb-6 text-primary stroke-[1.5]" />
            <div>
              <h3 className="text-xl font-semibold">Biztonságos fizetés</h3>
              <p className="text-sm text-muted-foreground mt-2">100%-os védelem a pénztárnál.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

