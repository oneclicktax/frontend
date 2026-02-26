"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

interface DraftConfirmDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onDiscard: () => void;
}

export function DraftConfirmDrawer({
  open,
  onOpenChange,
  onContinue,
  onDiscard,
}: DraftConfirmDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-lg font-bold">
            이전에 작성중이던 신고가 있습니다
          </DrawerTitle>
          <DrawerDescription>
            이어서 작성하시겠습니까?
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="flex-row gap-3">
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 rounded-lg border border-black-40 py-4 text-base font-bold text-black-100"
          >
            새로 작성
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 rounded-lg bg-primary-100 py-4 text-base font-bold text-white"
          >
            이어서 작성
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
