import Link from 'next/link'
import Image from 'next/image';
const Footer = () => {
  const footerLinks = [
    {
      title: 'About',
      items: [
        { label: '会社概要', href: '/footer/company' },
        { label: 'プライバシーポリシー', href: '/footer/privacypolicy' },
        { label: '利用規約', href: '/footer/ToU' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'お問い合わせ', href: 'footer/contact/contact' },
        // { label: 'ご利用ガイド', href: '/guide' },
        { label: '特定商取引法', href: '/footer/tokushoho' },
      ]
    },
    {
      title: 'Size Guide',
      items: [
        { label: 'MENS', href: '/size-guide/mens' },
        { label: 'LADIES', href: '/size-guide/ladies' },
        { label: 'KIDS', href: '/size-guide/kids' },
      ]
    },
  ]
 
  return (
    <footer className="w-full bg-white mt-20 border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* ロゴ */}
        <div className="flex justify-center mb-12">
          <Link href="/" className="text-2xl font-light tracking-widest">
            <Image src="/fipleheader.png" alt="fipleheader" width="200" height="80" />
          </Link>
        </div>


        {/* リンクセクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {footerLinks.map((section, idx) => (
            <div key={idx} className="text-center">
              <h3 className="text-sm font-medium mb-4 tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
 
        {/* コピーライト */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 FIPLE All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
 
export default Footer