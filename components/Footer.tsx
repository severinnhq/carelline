'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Facebook, Instagram } from 'lucide-react'
import { Sora } from 'next/font/google'
import { useRouter, usePathname } from 'next/navigation'
import { getScrollOffset } from '@/utils/scrollUtils'

const sora = Sora({ subsets: ['latin'] })

const Footer = () => {
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    const id = href.split('#')[1];
    if (!id) return;

    if (isHomePage) {
      // Already on home page, just scroll to the section
      const element = document.getElementById(id);
      if (element) {
        const offset = getScrollOffset(id);
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // Navigate to home page first, then scroll to section
      router.push('/');

      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = getScrollOffset(id);
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 600);
    }
  };

  return (
    <footer 
      id="footer" 
      className={`text-white py-12 px-4 ${sora.className}`}
      style={{ backgroundColor: '#671C1C ' }} // Dark red color (you can adjust this hex code)
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="mb-4">
            <Image
              src="/footerlogo.png"
              alt="Rewealed"
              width={150}
              height={50}
              className="w-auto h-auto"
            />
          </div>
          <p className="text-xl font-semibold">Minden másodperc számít</p>
          <div className="flex space-x-4">
            <Link href="https://www.facebook.com/profile.php?id=61573174178989" className="hover:text-white transition-colors">
              <Facebook size={20} />
            </Link>
            <Link href="https://www.instagram.com/carelline_official" className="hover:text-white transition-colors">
              <Instagram size={20} />
            </Link>
            <Link href="mailto:carelline@outlook.com" className="hover:text-white transition-colors">
              <Mail size={20} />
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Navigáció</h4>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/#hero" 
                className="hover:text-white transition-colors"
                onClick={(e) => handleSmoothScroll(e, '/#hero')}
              >
                Főoldal
              </Link>
            </li>
            <li>
              <Link 
                href="/#products" 
                className="hover:text-white transition-colors"
                onClick={(e) => handleSmoothScroll(e, '/#products')}
              >
                Termékek
              </Link>
            </li>
            <li>
              <Link 
                href="/#review-section" 
                className="hover:text-white transition-colors"
                onClick={(e) => handleSmoothScroll(e, '/#review-section')}
              >
                Vélemények
              </Link>
            </li>
            <li>
              <Link 
                href="/#feature-section" 
                className="hover:text-white transition-colors"
                onClick={(e) => handleSmoothScroll(e, '/#feature-section')}
              >
                Használat
              </Link>
            </li>
            <li>
              <Link 
                href="/#faq-section" 
                className="hover:text-white transition-colors"
                onClick={(e) => handleSmoothScroll(e, '/#faq-section')}
              >
                GYIK
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Információ</h4>
          <ul className="space-y-2">
          <li>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Adatvédelmi szabályzat
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-white transition-colors">
              Általános szerződési feltételek
            </Link>
          </li>
          <li>
            <Link href="/refund" className="hover:text-white transition-colors">
              Visszatérítési szabályzat
            </Link>
          </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-white text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Carelline. Minden jog fenntartva.</p>
      </div>
    </footer>
  )
}

export default Footer