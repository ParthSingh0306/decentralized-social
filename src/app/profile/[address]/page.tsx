import ProfileView from "@/components/ProfileView";

export default function ProfilePage({ 
  params 
}: { 
  params: { address: string } 
}) {
  return <ProfileView address={params.address} />;
}
