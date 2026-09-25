"use client";

import { useI18n } from "@/i18n/useI18n";
import HelpContent from "./HelpContent";
import Modal from "./Modal";

/** "How to play" dialog. */
export default function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.howToPlay}
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          {t.help.start}
        </button>
      }
    >
      <HelpContent headingLevel={3} />
    </Modal>
  );
}
