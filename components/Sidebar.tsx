import { X, Plus, Minus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface CartItem {
  product: {
    _id: string
    name: string
    price: number
    salePrice?: number
    mainImage: string
  }
  size: string
  quantity: number
}

interface SidebarProps {
  cartItems: CartItem[]
  onClose: () => void
  onRemoveItem: (index: number) => void
  onUpdateQuantity: (index: number, newQuantity: number) => void
  onCheckout: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ cartItems, onClose, onRemoveItem, onUpdateQuantity, onCheckout }) => {
  const totalPrice = cartItems.reduce((total, item) => {
    const itemPrice = item.product.salePrice || item.product.price
    return total + itemPrice * item.quantity
  }, 0)

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 overflow-y-auto flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.product._id}-${item.size}`} className="flex items-center space-x-4">
                <Image
                  src={`/uploads/${item.product.mainImage}`}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="rounded object-cover"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                  <p className="text-sm">
                    {item.product.salePrice ? (
                      <>
                        <span className="text-red-600 font-bold">${(item.product.salePrice * item.quantity).toFixed(2)}</span>
                        <span className="text-gray-500 line-through ml-2">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(index, item.quantity + 1)}>
                    <Plus size={16} />
                  </Button>
                  <span className="my-1">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}>
                    <Minus size={16} />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => onRemoveItem(index)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <p className="text-xl font-bold mb-4">Total: ${totalPrice.toFixed(2)}</p>
        <Button 
          className="w-full" 
          onClick={onCheckout}
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  )
}

export default Sidebar

