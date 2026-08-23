import { HomeHero } from "@/components/discover/HomeHero";
import { HomeFeatureGrid } from "@/components/discover/HomeFeatureGrid";

export default function HomeFeedPage() {
  return (
    // [&>div] chi ap dung cho THE div CON TRUC TIEP - vi vay noi dung trang
    // phia duoi BAT BUOC phai la <main> (khong phai <div>), khong thi CA 2
    // deu bi an theo (position:absolute + nen gradient), vo layout.
    <div>
      <main className="relative z-10 ">
        <HomeHero />
      </main>
    </div>
  );
}
