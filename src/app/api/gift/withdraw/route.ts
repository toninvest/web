import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest } from "next/server";
import { botService } from "@/lib/services/bot.service";
import { TransactionStatus, TransactionType } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const data = await req.json();

  if (!data.accountGiftId || typeof data.accountGiftId !== "string") {
    return new Response("InvalidGiftId", {
      status: 400,
    });
  }

  try {
    const transaction = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
      });

      const accountGift = await tx.account_gift.findFirstOrThrow({
        where: {
          id: data.accountGiftId,
          accountId: account.id,
          isSold: false,
          isWithdraw: false,
        },
      });

      await tx.account_gift.update({
        where: {
          id: accountGift.id,
        },
        data: {
          isWithdraw: true,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          amount: accountGift.price,
          accountId: account.id,
          status: TransactionStatus.pending,
          account_giftId: accountGift.id,
          type: TransactionType.withdraw,
        },
      });

      return transaction;
    });

    await botService.onWithdraw({ transactionId: transaction.id });

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("InternalServerError", {
      status: 500,
    });
  }
}
