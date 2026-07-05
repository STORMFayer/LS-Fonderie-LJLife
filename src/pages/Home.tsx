import { Nav } from '@/sections/Nav'
import { Hero } from '@/sections/Hero'
import { Stats } from '@/sections/Stats'
import { Process } from '@/sections/Process'
import { Testimonials } from '@/sections/Testimonials'
import { CTA } from '@/sections/CTA'
import { Footer } from '@/sections/Footer'

export function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Process />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
