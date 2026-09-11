"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const ARTICLE_IMAGE_LAYOUT_ID_PREFIX = "article-main-image-";

// Bam vao anh bia chinh cua bai -> xem toan man hinh, cung tinh than
// ProfileImageViewer.tsx (shared layoutId cua framer-motion, phong to tu
// dung vi tri thumbnail) nhung RUT GON - khong co bottom sheet Doi anh/Xoa
// anh (chi chu bai moi doi duoc anh bia, o day la XEM cho BAT KY ai doc,
// khong gan quyen so huu). layoutId gan theo postId (khong dung 1 hang so
// chung nhu Profile) vi trang nay co the render nhieu ArticleMainImage khac
// nhau cung luc (vd card "Bai lien quan") - dung hang so chung se lam
// framer-motion noi NHAM 2 anh khac postId voi nhau.
export function ArticleMainImage({
  imageUrl,
  alt,
  postId,
}: {
  imageUrl: string;
  alt: string;
  postId: string;
}) {
  const [open, setOpen] = useState(false);
  const layoutId = `${ARTICLE_IMAGE_LAYOUT_ID_PREFIX}${postId}`;

  return (
    <>
      <motion.button
        type="button"
        layoutId={layoutId}
        onClick={() => setOpen(true)}
        aria-label="Xem ảnh toàn màn hình"
        className="relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl bg-surface-muted"
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="900px"
          priority
          className="object-cover"
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm"
          >
            <div className="flex shrink-0 items-center justify-end px-4 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/10"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div
              className="flex min-h-0 flex-1 items-center justify-center px-4 pb-6"
              onClick={() => setOpen(false)}
            >
              <motion.div
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="relative h-full w-full overflow-hidden"
              >
                <Image src={imageUrl} alt={alt} fill className="object-contain" sizes="100vw" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
