import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, Briefcase } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Profile</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
              <CardDescription className="text-sm">Your company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary rounded-lg">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">Acme Industries Ltd.</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Manufacturing Sector</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-border rounded-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Email</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">contact@acmeindustries.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-border rounded-lg">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Telephone</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-border rounded-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Location</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Chicago, United States</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-border rounded-lg">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Business Sector</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Manufacturing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4 sm:pt-6">
            <Button variant="destructive" size="lg" className="w-full sm:w-auto" onClick={() => window.location.href = '/'}>
              Logout
            </Button>
          </div>
    </div>
  </main>
</div>
  );
};

export default Profile;
