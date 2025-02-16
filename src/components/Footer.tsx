import Link from "next/link"

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 text-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <nav className="mb-4">
            <ul className="flex flex-wrap justify-center">
              <li className="mx-4 my-2">
                <Link href="/" className="hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li className="mx-4 my-2">
                <Link href="/about" className="hover:text-blue-600">
                  About
                </Link>
              </li>
              <li className="mx-4 my-2">
                <Link href="/services" className="hover:text-blue-600">
                  Services
                </Link>
              </li>
              <li className="mx-4 my-2">
                <Link href="/works" className="hover:text-blue-600">
                  Works
                </Link>
              </li>
              <li className="mx-4 my-2">
                <Link href="/contact" className="hover:text-blue-600">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div className="mb-4 text-center">
            <p>© 2024 TN. All Rights Reserved.</p>
          </div>
          <div className="flex justify-center">
            <a href="#" className="mx-2 text-xl hover:text-blue-600">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="mx-2 text-xl hover:text-blue-600">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="mx-2 text-xl hover:text-blue-600">
              <i className="fab fa-google-plus-g"></i>
            </a>
            <a href="#" className="mx-2 text-xl hover:text-blue-600">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

