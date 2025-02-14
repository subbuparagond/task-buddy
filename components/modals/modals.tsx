import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

export type DialogueProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  open?: boolean;
  modalSize?: string;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
};

function Modal({
  title,
  description,
  children,
  modalSize = "",

  open,
  onOpenChange,
}: DialogueProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* <Button>{triggerButtonText}</Button> */}
      </DialogTrigger>
      <DialogContent
        className={`${modalSize} overflow-y-auto max-h-[80vh]`}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            {/* <Button variant="secondary">Cancel</Button> */}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
