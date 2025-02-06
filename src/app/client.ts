import { createThirdwebClient, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;

if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: clientId,
});

export const contract = getContract({
  client,
  chain: sepolia,
  address: "0x2c262184C37a290E727F739FA3b9Dba6a99E651e",
});
