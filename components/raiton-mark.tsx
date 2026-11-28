/**
 * Raiton brand mark, authored as inline SVG so the splash can trace every
 * contour with a stroke before settling into the filled logo.
 *
 * The colours come from CSS variables (`--splash-*`) defined in globals.css,
 * so the mark follows the site palette in both light and dark mode.
 */
export function RaitonMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1090.762 994.63"
      className={className}
      role="img"
      aria-label="Raiton"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="raiton-splash-gradient"
          x1="571.051"
          y1="-447.157"
          x2="1306.849"
          y2="288.641"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" style={{ stopColor: "var(--splash-grad-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--splash-grad-b)" }} />
        </linearGradient>
      </defs>

      <g>
        {/* Rounded triangle silhouette */}
        <path
          d="M659.702 930.102 L877.85 568.694 L1071.343 248.133 C1125.062 159.136 1060.974 45.594 957.021 45.594 L545.381 45.594 L133.741 45.594 C29.788 45.594 -34.3 159.136 19.419 248.133 L213.032 568.894 L431.059 930.102 C482.992 1016.14 607.77 1016.14 659.702 930.102 Z"
          className="splash-mark__shape splash-mark__shape--base splash-mark__gradient"
          pathLength={1}
        />

        {/* Inner rose sweep */}
        <path
          d="M740.078 740.22 L836.862 159.006 C845.019 110.02 796.403 70.998 750.342 89.559 L180.839 319.045 C134.777 337.606 126.8 399.433 166.642 429.077 L639.362 780.805 C677.545 809.215 732.261 787.167 740.078 740.22 Z"
          className="splash-mark__shape splash-mark__shape--swoosh splash-mark__rose"
          pathLength={1}
        />

        {/* Small coral triangles */}
        <polygon
          points="766.332,894.965 737.374,842.474 706.394,896.132"
          className="splash-mark__shape splash-mark__shape--triangle splash-mark__shape--tri-a splash-mark__coral"
          pathLength={1}
        />
        <polygon
          points="145.332,179.965 116.374,127.474 85.394,181.132"
          className="splash-mark__shape splash-mark__shape--triangle splash-mark__shape--tri-b splash-mark__coral"
          pathLength={1}
        />
        <polygon
          points="293.126,748.555 262.146,697.23 233.279,752.054"
          className="splash-mark__shape splash-mark__shape--triangle splash-mark__shape--tri-c splash-mark__coral"
          pathLength={1}
        />

        <g>
          {/* Deep plum mask */}
          <path
            d="M598.965 33.387 C466.645 -60.659 269.805 73.848 269.805 73.848 C266.866 76.582 261.603 82.05 261.603 82.05 C261.603 82.05 262.03 82.091 262.808 82.181 C288.76 79.5 327.736 82.525 372.315 109.474 C452.954 158.222 526.79 273.969 531.165 423.786 C533.662 509.333 490.167 588.447 452.387 640.595 C470.885 639.769 460.084 721.232 460.084 721.232 C362.376 842.108 348.541 931.195 348.541 931.195 C368.225 846.991 588.029 685.145 588.029 685.145 C588.029 685.145 721.443 533.141 733.472 460.966 C745.501 388.792 731.285 127.432 598.965 33.387 Z"
            className="splash-mark__shape splash-mark__shape--ink splash-mark__ink"
            pathLength={1}
          />

          {/* Pale face */}
          <path
            d="M451.882 200.154 C391.354 99.85 275.743 83.693 262.808 82.181 C241.816 84.35 229.344 90.251 229.344 90.251 C229.344 90.251 136.391 502.522 398.845 703.736 C398.845 703.736 424.004 679.772 452.387 640.595 C450.235 640.691 447.688 641.9 444.68 644.481 C437.859 652.641 435.02 654.968 439.674 649.566 C441.472 647.478 443.133 645.808 444.68 644.481 C464.459 620.818 517.805 547.982 519.682 471.355 C522.077 373.614 490.156 263.58 451.882 200.154 Z M240.826 362 C240.826 362 274.726 362 343.62 317.164 L321.749 351.064 L250.668 372.935 C250.668 372.935 251.761 472.449 273.633 520.565 C273.633 520.565 246.294 500.881 240.826 362 Z M400.744 167.873 C390.788 193.701 345.385 318.22 340.015 453.941 L372.052 461.513 L372.052 475.766 L339.594 468.663 C339.557 470.748 339.53 472.834 339.513 474.922 L379.707 483.384 L377.52 498.694 L339.582 490.079 C340.674 555.479 352.403 621.668 382.988 679.131 C382.988 679.131 336.433 618.853 334.045 488.821 L314.92 484.478 L317.375 470.262 L333.969 473.755 C333.986 471.671 334.014 469.569 334.054 467.451 L307.003 461.532 L311.907 447.297 L334.513 452.64 C337.744 377.711 355.427 283.244 400.744 167.873 C401.978 164.67 402.672 162.973 402.672 162.973 C402.02 164.613 401.385 166.241 400.744 167.873 Z"
            className="splash-mark__shape splash-mark__shape--paper splash-mark__paper"
            pathLength={1}
          />

          {/* Graphite detail */}
          <path
            d="M439.674 649.566 C435.02 654.968 437.859 652.641 444.68 644.481 C443.133 645.808 441.472 647.478 439.674 649.566 Z"
            className="splash-mark__shape splash-mark__shape--shade splash-mark__shade"
            pathLength={1}
          />

          {/* Face highlight */}
          <path
            d="M531.165 423.786 C526.79 273.969 452.954 158.222 372.315 109.474 C327.736 82.525 288.76 79.5 262.808 82.181 C275.743 83.693 391.354 99.85 451.882 200.154 C490.156 263.58 522.077 373.614 519.682 471.355 C517.805 547.982 464.459 620.818 444.68 644.481 C447.688 641.9 450.235 640.691 452.387 640.595 C490.167 588.447 533.662 509.333 531.165 423.786 Z"
            className="splash-mark__shape splash-mark__shape--paper-inner splash-mark__paper"
            pathLength={1}
          />

          {/* Peach glint */}
          <path
            d="M794.165 414.49 C794.165 414.49 730.738 596.02 788.697 614.611 C846.655 633.201 819.316 609.143 866.339 652.885 C866.339 652.885 543.194 600.941 349.088 931.742 C349.088 931.742 367.519 818.559 562.251 688.152 C756.984 557.746 567.029 492.133 567.029 492.133 C567.029 492.133 652.002 497.601 794.165 414.49 Z"
            className="splash-mark__shape splash-mark__shape--peach splash-mark__peach"
            pathLength={1}
          />
        </g>
      </g>
    </svg>
  );
}
