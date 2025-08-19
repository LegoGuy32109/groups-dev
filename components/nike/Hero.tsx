import Button from "./Button.tsx";

export default function Hero() {
  return (
    <section
      id="home"
      class="w-full px-8 flex xl:flex-row flex-col min ch-screen gap-10 max-container"
    >
      <div class="relative xl:w-2/5 flex flex-col justify-center items-start w-full pt-28">
        <p class="text-xl font-light text-red-500">Our Summer Collection</p>
        <h1 class="mt-10 font-extrabold text-8xl max-sm:text-[72px] max-sm:leading-[82px]">
          <span>The New Arrival</span>
          <br />
          <span class="text-red-500 inline-block mt-3 mr-3">Nike</span>Shoes
        </h1>
        <p class="font-light text-slate-400 text-lg leading-8 mt-6 mb-14 sm:max-w-sm">
          Discover stylish Nike arrivals, quality comfort, and innovation for
          your active life.
        </p>
        <Button label="Shop now" icon="➡️" />
        <div class="flex justify-start items-start flex-wrap w-full mt-20 gap-16">
          <div>
            <p class="text-4xl font-bold">1k+</p>
            <p class="text-slate-400 pl-1.5 font-extralight italic">Brands</p>
          </div>
          <div>
            <p class="text-4xl font-bold">500+</p>
            <p class="text-slate-400 font-extralight italic">Shops</p>
          </div>
          <div>
            <p class="text-4xl font-bold">250k+</p>
            <p class="text-slate-400 font-extralight italic">Customers</p>
          </div>
        </div>
      </div>
    </section>
  );
}
