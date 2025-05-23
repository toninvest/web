"use client";

import { AccountWithGifts } from "@/app/api/account/selector";
import { TonIcon } from "@/components/TonIcon";
import { Avatar, Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "motion/react";

const MotionBox = motion(Box);

export type ReferralProps = {
  account: NonNullable<AccountWithGifts["referral"]>["accounts"][number];
};

export const Referral = (props: ReferralProps) => {
  const deposit = props.account.transactions.reduce(
    (total, tx) => total + tx.amount,
    0
  );
  return (
    <MotionBox
      w="full"
      borderRadius="lg"
      shadow="lg"
      py="2"
      pl="3"
      pr="6"
      bgColor="background.primary"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <HStack justifyContent="space-between" align="center">
        <HStack gap="3">
          <Avatar.Root shape="full" size="lg">
            <Avatar.Fallback name={props.account.username} />
            <Avatar.Image src={props.account.avatarUrl ?? undefined} />
          </Avatar.Root>
          <VStack gap="0" align="flex-start">
            <Text fontWeight="600" fontSize="14px">
              @{props.account.username}
            </Text>
            <Text color="text.secondary" fontSize="12px">
              Opened {props.account._count.gifts} cases
            </Text>
          </VStack>
        </HStack>

        <Flex align="center" gap="1">
          <Text fontSize="17px" fontWeight="600">
            {deposit.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <TonIcon boxSize="17px" />
        </Flex>
      </HStack>
    </MotionBox>
  );
};
