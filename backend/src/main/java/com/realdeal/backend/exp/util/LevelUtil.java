package com.realdeal.backend.exp.util;

public final class LevelUtil {

    // EXP needed to *reach* each level (index 0 = Lv1, …, 29 = Lv30).
    public static final int[] THRESHOLDS = {
        0,50,120,210,320,450,600,760,930,1110,
        1300,1500,1710,1930,2160,2400,2650,2910,3180,3460,
        3750,4050,4360,4680,5010,5350,5700,6060,6430
    };

    private LevelUtil() {}          // util class, no instances

    public static int levelFor(int exp) {
        for (int i = THRESHOLDS.length - 1; i >= 0; i--) {
            if (exp >= THRESHOLDS[i]) return i + 1;
        }
        return 1;
    }

    public static int expForNext(int exp) {
        int lv = levelFor(exp);
        return lv == THRESHOLDS.length ? THRESHOLDS[lv-1] : THRESHOLDS[lv];
    }
}
