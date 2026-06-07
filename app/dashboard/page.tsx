import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RouteGuard from "@/components/layout/RouteGuard";
import ProfileCard from "@/components/dashboard/ProfileCard";
import WalletCard from "@/components/dashboard/WalletCard";
import BookmarkList from "@/components/dashboard/BookmarkList";
import PurchaseHistory from "@/components/dashboard/PurchaseHistory";
import FollowedStories from "@/components/dashboard/FollowedStories";
import OrnamentalDivider from "@/components/shared/OrnamentalDivider";

export default function DashboardPage() {
  return (
    <RouteGuard allowedRoles={["user", "creator", "admin"]}>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">บัญชีของฉัน</h1>
          <p className="text-sm text-muted-foreground">
            จัดการบัญชีและประวัติการอ่านของคุณ
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <ProfileCard />
            <WalletCard />
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="bookmarks">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bookmarks">บุ๊คมาร์คและติดตาม</TabsTrigger>
                <TabsTrigger value="purchases">ประวัติซื้อ</TabsTrigger>
              </TabsList>
              <TabsContent value="bookmarks" className="mt-4">
                <div className="space-y-6">
                  <section className="space-y-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        บุ๊คมาร์ค
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        รายการที่คุณบันทึกไว้อ่านต่อ
                      </p>
                    </div>
                    <BookmarkList />
                  </section>

                  <section className="space-y-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        ติดตาม
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        เรื่องที่คุณติดตามเพื่อรออัปเดตตอนใหม่
                      </p>
                    </div>
                    <FollowedStories />
                  </section>
                </div>
              </TabsContent>
              <TabsContent value="purchases" className="mt-4">
                <PurchaseHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
