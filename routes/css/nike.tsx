import CustomerReviews from "../../components/nike/CustomerReviews.tsx";
import Footer from "../../components/nike/Footer.tsx";
import Hero from "../../components/nike/Hero.tsx";
import PopularProducts from "../../components/nike/PopularProducts.tsx";
import Services from "../../components/nike/Services.tsx";
import Subscribe from "../../components/nike/Subscribe.tsx";
import SuperQuality from "../../components/nike/SuperQuality.tsx";
import Nav from "../../components/nike/Nav.tsx";
import { Head } from "$fresh/runtime.ts";
export default function NikePage() {
  return (
    <>
      <Head>
        <title>Nike - Working</title>
      </Head>
      <main class="relative">
        <Nav />
        <section class="xl:padding-1 wide:padding-t">
          <Hero />
        </section>
        <section class="padding">
          <PopularProducts />
        </section>
        <section class="padding">
          <SuperQuality />
        </section>
        <section class="padding">
          <Services />
        </section>
        <section class="padding">
          <CustomerReviews />
        </section>
        <section class="padding w-full">
          <Subscribe />
        </section>
        <section class="padding">
          <Footer />
        </section>
      </main>
    </>
  );
}
