import { nft } from "@/generated/prisma";

export class CaseService<T extends Pick<nft, "id" | "price">> {
  private static EXPONENT = 1.8;

  public open(nfts: T[]): T {
    const gifts = this.calculateOdds(nfts);
    const totalRate = gifts.reduce((sum, gift) => sum + gift.odds, 0);
    const rand = Math.random() * totalRate;

    let cumulative = 0;
    for (const gift of gifts) {
      cumulative += gift.odds;
      if (rand < cumulative) {
        return gift;
      }
    }

    return nfts[nfts.length - 1];
  }

  public calculateOdds(nfts: T[]): (T & { odds: number })[] {
    const weights = nfts.map(
      (nft) => 1 / Math.pow(nft.price, CaseService.EXPONENT)
    );
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    return nfts.map((nft, i) => ({
      ...nft,
      odds: +((weights[i] / totalWeight) * 100).toFixed(2),
    }));
  }

  public calculatePrice(nfts: T[], margin: number): number {
    const gifts = this.calculateOdds(nfts);
    return (
      +gifts
        .reduce((sum, gift) => sum + gift.price * (gift.odds / 100), 0)
        .toFixed(2) *
      (1 + margin)
    );
  }
}

export const caseService = Object.freeze(new CaseService());
