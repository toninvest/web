import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const account = await prisma.account.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      include: {
        _count: {
          select: {
            gifts: true,
          },
        },
        gifts: {
          include: {
            nft: true,
            case: true,
          },
          where: {
            isWithdraw: false,
            isSold: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        transactions: true,
        referral: {
          include: {
            accounts: {
              include: {
                transactions: true,
                _count: {
                  select: {
                    gifts: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return Response.json(account);
  } catch (error) {
    console.log(error);
    return new Response("NotAuthorized", { status: 401 });
  }
}
