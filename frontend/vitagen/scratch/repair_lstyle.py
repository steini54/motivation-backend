import os
import re

path = r"c:\Project\CV Generator Client\motivation-backend\frontend\vitagen\lebenslauf\lstyle.css"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# We know that at the end of the file there's a big mess.
# Let's just find the first @media (max-width: 1180px) and EVERYTHING after it, and replace it.
# BUT we need to extract any payment styles that were pasted inside.

# The payment styles start with .payment-close or .payment-modal
payment_start = content.find(".payment-modal {")
if payment_start != -1:
    # Find where the duplicate @media (prefers-reduced-motion: reduce) starts
    dup_media = content.find("@media (prefers-reduced-motion: reduce)", payment_start)
    if dup_media != -1:
        # Extract the payment CSS
        payment_css = content[payment_start:dup_media].strip()
        
        # Now rebuild the file
        # Find where the FIRST @media (max-width: 1180px) started
        first_1180 = content.find("@media (max-width: 1180px) {")
        
        # Keep everything before first_1180
        good_part = content[:first_1180]
        
        # Append the payment css here
        good_part += payment_css + "\n\n"
        
        # Append the correct media queries
        good_part += """@media (max-width: 1180px) {
  .builder-grid {
    grid-template-columns: minmax(0, 1fr) 390px;
  }

  .section-rail {
    display: none;
  }
}

@media (max-width: 920px) {
  .builder-grid {
    grid-template-columns: 1fr;
  }

  .preview-column {
    position: static;
    order: -1;
  }

  .hero {
    display: grid;
  }

  .hero-meter {
    display: none;
  }
}

@media (max-width: 720px) {
  .page-shell {
    width: min(100% - 20px, 1440px);
    padding-top: 18px;
  }

  .field-grid.two,
  .split-card,
  .photo-card-grid,
  .entry-body,
  .modal-grid {
    grid-template-columns: 1fr;
  }

  .photo-options {
    grid-template-columns: 1fr;
  }

  .preview-dialog {
    width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
    padding: 14px;
  }
}

.live-dot {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #e8f7f2;
  color: #0e666b;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}

.live-dot::before {
  content: "";
  display: block;
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  position: relative;
  top: 1px;
  animation: live-pulse 2s infinite;
}

@keyframes live-pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
"""
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(good_part)
        print("Successfully rebuilt lstyle.css")
    else:
        print("Could not find dup_media")
else:
    print("Could not find payment_modal")
