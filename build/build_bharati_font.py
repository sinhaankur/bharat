#!/usr/bin/env python3
"""
build_bharati_font.py  —  an original, "Bharati-inspired" display typeface.

WHAT THIS IS (and is not)
-------------------------
This builds our OWN original geometric display font, *inspired by* the design
principles of the Bharati link-script (IIT Madras) — an even monoline stroke,
open humanist counters, and deliberately NO Devanagari-style top headline bar
(the "shirorekha"), giving a clean Latin-like baseline. It is NOT a copy of the
IIT Bharati glyphs (those are not released as an open font); every outline here
is drawn from scratch in this file and is ours to license under the OFL.

Coverage (proof-of-concept, expandable): space, A–Z, a–z, 0–9, and the common
punctuation used across the atlas. Designed on a 1000 upm grid.

REPRODUCIBLE — matches the repo's generator pattern (cf. build_temple_forms.py).
Requires fontTools + brotli; run in the project venv:

    .venv-font/bin/python build_bharati_font.py

Outputs:
    assets/fonts/BharatiInspired-Regular.ttf
    assets/fonts/BharatiInspired-Regular.woff2
    assets/fonts/OFL.txt              (license)
    assets/fonts/README.md            (what it is / honesty note)

Design metrics (1000 upm):
    ascender  760      cap height 700     x-height 500
    descender -200     baseline   0       stem      ~90
"""

import os
import sys

try:
    from fontTools.fontBuilder import FontBuilder
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from fontTools.pens.recordingPen import RecordingPen
    from fontTools.pens.cu2quPen import Cu2QuPen
    from fontTools.misc.transform import Identity
except ImportError:
    sys.exit("fontTools not found. Run:  python3 -m venv .venv-font && "
             ".venv-font/bin/pip install fonttools brotli, then use "
             ".venv-font/bin/python build_bharati_font.py")

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets", "fonts")
os.makedirs(OUT, exist_ok=True)

UPM = 1000
ASC, DESC = 760, -200
CAP, XH = 700, 500
FAMILY = "Bharati Inspired"
STYLE = "Regular"
VERSION = "1.000"

# ----------------------------------------------------------------------------
# tiny outline toolkit — glyphs are lists of contours; each contour is a list of
# segments. We support straight lines and cubic curves via a compact mini-DSL so
# the letter definitions below stay readable.
#   ("m", x, y)                 moveTo
#   ("l", x, y)                 lineTo
#   ("c", x1,y1, x2,y2, x,y)    curveTo (cubic)
#   ("q", x1,y1, x,y)           qCurveTo (quadratic) — rarely needed
# Contours auto-close.
# ----------------------------------------------------------------------------

def draw(pen, contours):
    for c in contours:
        pen.moveTo((c[0][1], c[0][2]))
        for seg in c[1:]:
            t = seg[0]
            if t == "l":
                pen.lineTo((seg[1], seg[2]))
            elif t == "c":
                pen.curveTo((seg[1], seg[2]), (seg[3], seg[4]), (seg[5], seg[6]))
            elif t == "q":
                pen.qCurveTo((seg[1], seg[2]), (seg[3], seg[4]))
        pen.closePath()


def rect(x0, y0, x1, y1):
    """A filled rectangle contour (counter-clockwise)."""
    return [("m", x0, y0), ("l", x1, y0), ("l", x1, y1), ("l", x0, y1)]


def hole(x0, y0, x1, y1):
    """A rectangular hole (clockwise winding to subtract)."""
    return [("m", x0, y0), ("l", x0, y1), ("l", x1, y1), ("l", x1, y0)]


# monoline stem widths
ST = 92          # vertical stem
STH = 88         # horizontal bar
K = 0.5523       # cubic circle constant


def ring(cx, cy, rx, ry, cw=False):
    """Approximate an ellipse with 4 cubic segments. cw=True → clockwise (hole)."""
    ox, oy = rx * K, ry * K
    if not cw:
        return [
            ("m", cx, cy + ry),
            ("c", cx + ox, cy + ry, cx + rx, cy + oy, cx + rx, cy),
            ("c", cx + rx, cy - oy, cx + ox, cy - ry, cx, cy - ry),
            ("c", cx - ox, cy - ry, cx - rx, cy - oy, cx - rx, cy),
            ("c", cx - rx, cy + oy, cx - ox, cy + ry, cx, cy + ry),
        ]
    else:
        return [
            ("m", cx, cy + ry),
            ("c", cx - ox, cy + ry, cx - rx, cy + oy, cx - rx, cy),
            ("c", cx - rx, cy - oy, cx - ox, cy - ry, cx, cy - ry),
            ("c", cx + ox, cy - ry, cx + rx, cy - oy, cx + rx, cy),
            ("c", cx + rx, cy + oy, cx + ox, cy + ry, cx, cy + ry),
        ]


def v_stem(x, y0, y1):
    return rect(x, y0, x + ST, y1)


def h_bar(x0, x1, y):
    return rect(x0, y, x1, y + STH)


# ----------------------------------------------------------------------------
# GLYPH LIBRARY
# Each entry: char -> (advance_width, [contours])
# The house style: monoline, generous counters, flat terminals, no headline bar.
# Uppercase on CAP height (700); lowercase on x-height (500) with asc/desc.
# ----------------------------------------------------------------------------

GLYPHS = {}
def G(ch, adv, contours):
    GLYPHS[ch] = (adv, contours)


# --- space ---
G(" ", 300, [])

# ---------- UPPERCASE ----------
# I
G("I", 300, [v_stem(104, 0, CAP)])

# H
G("H", 660, [v_stem(104, 0, CAP), v_stem(660 - 104 - ST, 0, CAP),
             h_bar(104 + ST, 660 - 104 - ST, CAP/2 - STH/2)])

# L
G("L", 560, [v_stem(104, 0, CAP), h_bar(104, 500, 0)])

# T
G("T", 620, [h_bar(60, 560, CAP - STH), rect(620/2 - ST/2, 0, 620/2 + ST/2, CAP - STH)])

# E
G("E", 600, [v_stem(104, 0, CAP), h_bar(104, 540, CAP - STH),
             h_bar(104, 500, CAP/2 - STH/2), h_bar(104, 540, 0)])

# F
G("F", 580, [v_stem(104, 0, CAP), h_bar(104, 540, CAP - STH),
             h_bar(104, 500, CAP/2 - STH/2)])

# O  (ring + hole)
G("O", 720, [ring(360, CAP/2, 300, CAP/2), ring(360, CAP/2, 300 - ST, CAP/2 - ST, cw=True)])

# Q  (O + tail)
G("Q", 740, [ring(370, CAP/2, 300, CAP/2), ring(370, CAP/2, 300 - ST, CAP/2 - ST, cw=True),
             rect(430, -30, 430 + ST, 170)])

# C  (open ring)
def C_shape(cx, cy, R, adv):
    r = R - ST
    return (adv, [[
        ("m", cx + R*0.72, cy + R*0.62),
        ("c", cx + R*0.30, cy + R, cx - R, cy + R*0.72, cx - R, cy),
        ("c", cx - R, cy - R*0.72, cx + R*0.30, cy - R, cx + R*0.72, cy - R*0.62),
        ("l", cx + R*0.72 - 20, cy - R*0.62 + 40),
        ("c", cx + R*0.20, cy - r, cx - r, cy - r*0.72, cx - r, cy),
        ("c", cx - r, cy + r*0.72, cx + R*0.20, cy + r, cx + R*0.72 - 20, cy + R*0.62 - 40),
    ]])
GLYPHS["C"] = C_shape(360, CAP/2, 300, 700)

# G  (C with bar)
gadv, gc = C_shape(360, CAP/2, 300, 720)
gc = list(gc)
gc.append(rect(360, CAP/2 - STH/2, 360 + 300, CAP/2 + STH/2))   # cross stub
gc.append(rect(360 + 300 - ST, CAP/2 - STH/2, 360 + 300, CAP/2 + 40))  # inner vertical
GLYPHS["G"] = (gadv, gc)

# D
G("D", 720, [
    v_stem(104, 0, CAP),
    [("m", 104+ST, CAP-STH),
     ("c", 104+ST+260, CAP-STH, 660, CAP-STH-120, 660, CAP/2),
     ("c", 660, STH+120, 104+ST+260, STH, 104+ST, STH),
     ("l", 104+ST, 0),  # note: closes back; approximate D bowl outer
     ("l", 104, 0), ("l", 104, CAP), ("l", 104+ST, CAP)],
])
# simpler robust D: stem + bowl ring clipped — redefine cleanly
G("D", 720, [
    rect(104, 0, 104+ST, CAP),
    [("m", 104+ST, 0),
     ("l", 380, 0),
     ("c", 560, 0, 660, 150, 660, CAP/2),
     ("c", 660, CAP-150, 560, CAP, 380, CAP),
     ("l", 104+ST, CAP),
     ("l", 104+ST, CAP-STH),
     ("l", 380, CAP-STH),
     ("c", 500, CAP-STH, 568, CAP-160, 568, CAP/2),
     ("c", 568, 160, 500, STH, 380, STH),
     ("l", 104+ST, STH)],
])

# P
G("P", 640, [
    rect(104, 0, 104+ST, CAP),
    [("m", 104+ST, CAP),
     ("l", 400, CAP),
     ("c", 540, CAP, 610, CAP-90, 610, CAP-210),
     ("c", 610, CAP-330, 540, CAP-420, 400, CAP-420),
     ("l", 104+ST, CAP-420),
     ("l", 104+ST, CAP-420-STH),
     ("l", 400, CAP-420-STH),
     ("c", 470, CAP-420-STH, 518, CAP-360, 518, CAP-210),
     ("c", 518, CAP-260+ -0, 470, CAP-STH, 400, CAP-STH),
     ("l", 104+ST, CAP-STH)],
])

# R  (P + leg)
radv, rc = 660, [c[:] for c in GLYPHS["P"][1]]
rc.append([("m", 360, CAP-420), ("l", 470, CAP-420-40), ("l", 610, 0), ("l", 490, 0),
           ("l", 360, CAP-420-STH)])
GLYPHS["R"] = (radv, rc)

# B
G("B", 640, [
    rect(104, 0, 104+ST, CAP),
    # upper bowl
    [("m", 104+ST, CAP), ("l", 400, CAP),
     ("c", 520, CAP, 580, CAP-70, 580, CAP-175),
     ("c", 580, CAP-280, 520, CAP-350, 400, CAP-350),
     ("l", 104+ST, CAP-350), ("l", 104+ST, CAP-350-STH), ("l", 400, CAP-350-STH),
     ("c", 470, CAP-350-STH, 488, CAP-300, 488, CAP-175),
     ("c", 488, CAP-120, 470, CAP-STH, 400, CAP-STH), ("l", 104+ST, CAP-STH)],
    # lower bowl
    [("m", 104+ST, CAP-350-STH-0), ("l", 420, CAP-350-STH),
     ("c", 545, CAP-350-STH, 605, 280, 605, 175),
     ("c", 605, 70, 545, 0, 420, 0),
     ("l", 104+ST, 0), ("l", 104+ST, STH), ("l", 420, STH),
     ("c", 495, STH, 513, 120, 513, 175),
     ("c", 513, 300, 495, CAP-350-STH-STH, 420, CAP-350-STH-STH),
     ("l", 104+ST, CAP-350-STH-STH)],
])

# U
G("U", 680, [
    [("m", 104, CAP), ("l", 104+ST, CAP), ("l", 104+ST, 240),
     ("c", 104+ST, 110, 220, STH, 340, STH),
     ("c", 460, STH, 576-ST, 110, 576-ST, 240), ("l", 576-ST, CAP), ("l", 576, CAP),
     ("l", 576, 240), ("c", 576, 40, 470, -20, 340, -20),
     ("c", 210, -20, 104, 40, 104, 240)],
])

# J
G("J", 520, [
    [("m", 380, CAP), ("l", 380+ST, CAP), ("l", 380+ST, 210),
     ("c", 380+ST, 60, 300, -20, 180, -20),
     ("c", 80, -20, 20, 40, 10, 150), ("l", 100, 165),
     ("c", 108, 90, 140, 60, 188, 60),
     ("c", 250, 60, 380, 70, 380, 210)],
])

# N
G("N", 700, [v_stem(104, 0, CAP), v_stem(700-104-ST, 0, CAP),
             [("m", 104, CAP), ("l", 104+ST+8, CAP), ("l", 700-104-8, 0), ("l", 700-104-ST-8, 0),
              ("l", 104+8, CAP-1)]])
# cleaner N diagonal
G("N", 700, [rect(104, 0, 104+ST, CAP), rect(700-104-ST, 0, 700-104, CAP),
             [("m", 104, CAP), ("l", 196, CAP), ("l", 596, 90), ("l", 596, 0),
              ("l", 504, 0), ("l", 104, CAP-90)]])

# M
G("M", 820, [rect(104, 0, 104+ST, CAP), rect(820-104-ST, 0, 820-104, CAP),
             [("m", 104, CAP), ("l", 200, CAP), ("l", 410, 250), ("l", 620, CAP), ("l", 716, CAP),
              ("l", 470, 120), ("l", 350, 120), ("l", 104, CAP-40)],
             rect(410-ST/2, 60, 410+ST/2, 300)])

# V
G("V", 660, [[("m", 60, CAP), ("l", 160, CAP), ("l", 330, 150), ("l", 500, CAP), ("l", 600, CAP),
              ("l", 385, 0), ("l", 275, 0)]])

# W
G("W", 940, [[("m", 40, CAP), ("l", 140, CAP), ("l", 250, 170), ("l", 360, CAP), ("l", 460, CAP),
              ("l", 340, 0), ("l", 240, 0)],
             [("m", 480, CAP), ("l", 580, CAP), ("l", 690, 170), ("l", 800, CAP), ("l", 900, CAP),
              ("l", 780, 0), ("l", 680, 0)]])

# A
G("A", 700, [[("m", 350, CAP), ("l", 430, CAP), ("l", 660, 0), ("l", 560, 0), ("l", 350, CAP-120)],
             [("m", 350, CAP), ("l", 270, CAP), ("l", 40, 0), ("l", 140, 0), ("l", 350, CAP-120)],
             h_bar(190, 510, 230)])

# K
G("K", 660, [v_stem(104, 0, CAP),
             [("m", 104+ST, CAP/2 - 20), ("l", 470, CAP), ("l", 590, CAP), ("l", 240, CAP/2-40),
              ("l", 240, CAP/2)],
             [("m", 300, CAP/2 + 60), ("l", 420, CAP/2 + 60), ("l", 620, 0), ("l", 500, 0),
              ("l", 300, CAP/2)]])
# simpler K
G("K", 640, [v_stem(96, 0, CAP),
             [("m", 188, 380), ("l", 470, CAP), ("l", 590, CAP), ("l", 280, 330), ("l", 188, 330)],
             [("m", 300, 360), ("l", 400, 300), ("l", 600, 0), ("l", 480, 0), ("l", 220, 360)]])

# X
G("X", 660, [[("m", 40, CAP), ("l", 160, CAP), ("l", 620, 0), ("l", 500, 0), ("l", 40, CAP-1)],
             [("m", 500, CAP), ("l", 620, CAP), ("l", 160, 0), ("l", 40, 0), ("l", 500, CAP-1)]])
# X as two clean bars via bowtie halves
G("X", 660, [[("m", 60, CAP), ("l", 175, CAP), ("l", 330, 430), ("l", 485, CAP), ("l", 600, CAP),
              ("l", 388, 350), ("l", 272, 350)],
             [("m", 272, 350), ("l", 388, 350), ("l", 600, 0), ("l", 485, 0), ("l", 330, 270),
              ("l", 175, 0), ("l", 60, 0), ("l", 272, 350)]])

# Y
G("Y", 640, [[("m", 60, CAP), ("l", 175, CAP), ("l", 320, 370), ("l", 465, CAP), ("l", 580, CAP),
              ("l", 366, 320)], rect(320-ST/2, 0, 320+ST/2, 340)])

# S
G("S", 620, [[
    ("m", 540, CAP-120),
    ("c", 500, CAP-40, 420, CAP, 320, CAP),
    ("c", 180, CAP, 80, CAP-90, 80, CAP-210),
    ("c", 80, CAP-330, 180, CAP-380, 340, CAP-410),
    ("c", 470, CAP-435, 520, CAP-470, 520, 220),
    ("c", 520, 120, 440, 70, 330, 70),
    ("c", 230, 70, 150, 120, 120, 210),
    ("l", 40, 170),
    ("c", 85, 40, 200, -20, 330, -20),
    ("c", 490, -20, 600, 70, 600, 220),
    ("c", 600, 360, 500, 415, 340, 445),
    ("c", 220, 468, 160, 500, 160, CAP-210),
    ("c", 160, CAP-120, 235, CAP-70, 330, CAP-70),
    ("c", 410, CAP-70, 455, CAP-110, 480, CAP-165),
]])

# Z
G("Z", 620, [h_bar(70, 560, CAP-STH), h_bar(70, 560, 0),
             [("m", 70, CAP-STH), ("l", 200, CAP-STH), ("l", 560, STH+30), ("l", 560, STH),
              ("l", 430, STH), ("l", 70, CAP-STH-30)]])
# clean Z diagonal
G("Z", 620, [h_bar(70, 560, CAP-STH), h_bar(70, 560, 0),
             [("m", 60, STH+0), ("l", 500, CAP-STH), ("l", 500, CAP-STH-120),
              ("l", 60, STH+120)]])
# final robust Z
G("Z", 620, [rect(70, CAP-STH, 560, CAP), rect(70, 0, 560, STH),
             [("m", 470, CAP-STH), ("l", 560, CAP-STH), ("l", 150, STH), ("l", 60, STH)]])

# ---------- lowercase ----------
# dotless base for i/j reused via dot()
def dot(cx, cy, r=52):
    return ring(cx, cy, r, r)

# l
G("l", 250, [v_stem(90, 0, CAP)])
# i
G("i", 250, [v_stem(90, 0, XH), dot(90+ST/2, XH+150)])
# j
G("j", 260, [[("m", 90, XH), ("l", 90+ST, XH), ("l", 90+ST, -40),
              ("c", 90+ST, -140, 40, -200, -40, -200), ("l", -40, -120),
              ("c", 20, -120, 90, -110, 90, -40)], dot(90+ST/2, XH+150)])

# o
G("o", 560, [ring(280, XH/2, 240, XH/2), ring(280, XH/2, 240-ST, XH/2-ST, cw=True)])
# c
GLYPHS["c"] = C_shape(255, XH/2, 235, 520)
# e
G("e", 560, [ring(280, XH/2, 240, XH/2), ring(280, XH/2, 240-ST, XH/2-ST, cw=True),
             rect(60, XH/2 - STH/2, 500, XH/2 + STH/2),
             hole(500 - 1, XH/2 - STH/2, 501, XH/2 + STH/2)])
# tidy e: bar + open mouth
G("e", 560, [
    [("m", 500, XH/2 - 30),
     ("c", 500, XH*0.85, 400, XH+20, 280, XH+20),
     ("c", 130, XH+20, 40, XH*0.62, 40, XH/2),
     ("c", 40, XH*0.20, 140, -20, 290, -20),
     ("c", 400, -20, 470, 30, 505, 110), ("l", 425, 150),
     ("c", 400, 95, 355, 55, 290, 55),
     ("c", 190, 55, 128, 120, 122, XH/2 - 30), ("l", 500, XH/2 - 30)],
    [("m", 122, XH/2 + 40),
     ("c", 132, XH*0.72, 195, XH-55, 280, XH-55),
     ("c", 365, XH-55, 410, XH*0.72, 415, XH/2 + 40), ("l", 122, XH/2 + 40)],
])

# n
G("n", 560, [v_stem(70, 0, XH),
             [("m", 70, XH-STH), ("c", 150, XH+20, 470, XH+30, 470, XH-210),
              ("l", 470, 0), ("l", 470-ST, 0), ("l", 470-ST, XH-230),
              ("c", 470-ST, XH-120, 250, XH-70, 162, XH-STH)]])
# clean n
G("n", 560, [v_stem(70, 0, XH), v_stem(400, 0, XH-40),
             [("m", 70, XH-STH), ("c", 180, XH+30, 400, XH+20, 460, XH-160), ("l", 460, XH-160-STH),
              ("c", 405, XH-60, 210, XH-40, 162, XH-STH)]])
# arch-based n (robust) — arch springs from INSIDE the stem so overlap is solid
def arch(x0, x1, top, botL, botR, springY):
    """A monoline arch from left stem (x0) to right stem (x1). Solid overlap into stems."""
    xl_in, xl_out = x0 - 6, x0 + ST + 2
    xr_in, xr_out = x1 + ST + 6, x1 - 2
    cx = (x0 + ST + x1) / 2
    return [
        ("m", x0 - 6, springY),
        ("c", x0 - 6, top + 40, cx - 40, top + 40, cx, top + 40),
        ("c", cx + 40, top + 40, x1 + ST + 6, top + 40, x1 + ST + 6, springY),
        ("l", x1 + ST + 6, botR),
        ("l", x1 - 2, botR),
        ("l", x1 - 2, springY),
        ("c", x1 - 2, top - STH + 40, cx + 30, top - STH + 40, cx, top - STH + 40),
        ("c", cx - 30, top - STH + 40, x0 + ST + 2, top - STH + 40, x0 + ST + 2, springY),
        ("l", x0 + ST + 2, botL),
        ("l", x0 - 6, botL),
    ]
G("n", 560, [rect(70, 0, 70+ST, XH), rect(398, 0, 398+ST, XH),
             arch(70, 398, XH-STH, XH, XH, XH-170)])

# m — two arches sharing the middle stem
G("m", 840, [rect(70, 0, 70+ST, XH), rect(378, 0, 378+ST, XH), rect(686, 0, 686+ST, XH),
             arch(70, 378, XH-STH, XH, XH, XH-170),
             arch(378, 686, XH-STH, XH, XH, XH-170)])

# r — left half of an arch (stem + shoulder)
G("r", 400, [rect(70, 0, 70+ST, XH),
             [("m", 70 - 6, XH-170),
              ("c", 70-6, XH-STH+40, 220, XH-STH+40, 330, XH-STH-10),
              ("l", 300, XH-STH-10-STH+18),
              ("c", 210, XH-STH-30, 70+ST+2, XH-STH-30, 70+ST+2, XH-170)]])

# h — like n but full ascender left stem
G("h", 560, [rect(70, 0, 70+ST, CAP), rect(398, 0, 398+ST, XH),
             arch(70, 398, XH-STH, XH, XH, XH-170)])
# b
G("b", 560, [v_stem(70, 0, CAP),
             ring(300, XH/2, 200, XH/2), ring(300, XH/2, 200-ST, XH/2-ST, cw=True),
             hole(70, XH/2-XH/2, 70+ST, XH)])
# clean b: stem + bowl
G("b", 570, [rect(70, 0, 70+ST, CAP),
             [("m", 70+ST, XH-STH),
              ("c", 160, XH+20, 500, XH+10, 500, XH/2),
              ("c", 500, -10, 160, -20, 70+ST, STH),
              ("l", 70+ST, STH+STH),
              ("c", 150, 60, 405, 55, 405, XH/2),
              ("c", 405, XH-55, 150, XH-60, 70+ST, XH-STH-STH)]])
# d (mirror of b)
dadv, dbowl = GLYPHS["b"]
G("d", 570, [rect(570-70-ST, 0, 570-70, CAP),
             [("m", 570-(70+ST), XH-STH),
              ("c", 570-160, XH+20, 570-500, XH+10, 570-500, XH/2),
              ("c", 570-500, -10, 570-160, -20, 570-(70+ST), STH),
              ("l", 570-(70+ST), STH+STH),
              ("c", 570-150, 60, 570-405, 55, 570-405, XH/2),
              ("c", 570-405, XH-55, 570-150, XH-60, 570-(70+ST), XH-STH-STH)]])
# p
G("p", 570, [rect(70, DESC, 70+ST, XH),
             [("m", 70+ST, XH-STH),
              ("c", 160, XH+20, 500, XH+10, 500, XH/2),
              ("c", 500, -10, 160, -20, 70+ST, STH),
              ("l", 70+ST, STH+STH),
              ("c", 150, 60, 405, 55, 405, XH/2),
              ("c", 405, XH-55, 150, XH-60, 70+ST, XH-STH-STH)]])
# q
G("q", 570, [rect(570-70-ST, DESC, 570-70, XH),
             [("m", 570-(70+ST), XH-STH),
              ("c", 570-160, XH+20, 570-500, XH+10, 570-500, XH/2),
              ("c", 570-500, -10, 570-160, -20, 570-(70+ST), STH),
              ("l", 570-(70+ST), STH+STH),
              ("c", 570-150, 60, 570-405, 55, 570-405, XH/2),
              ("c", 570-405, XH-55, 570-150, XH-60, 570-(70+ST), XH-STH-STH)]])

# u
G("u", 560, [rect(70, XH/2, 70+ST, XH), rect(398, 0, 398+ST, XH),
             [("m", 70, XH/2), ("c", 70, 40, 180, -20, 300, -20),
              ("c", 360, -20, 410, 0, 448, 40), ("l", 448, 150),
              ("c", 410, 70, 350, 55, 300, 55),
              ("c", 210, 55, 162, 90, 162, XH/2)]])
# a — single-storey: round bowl + straight right stem (clean, no hook overshoot)
G("a", 540, [
    ring(250, XH/2, 200, XH/2), ring(250, XH/2, 200-ST, XH/2-ST, cw=True),
    rect(450-ST, 0, 450, XH/2 + 60),   # right stem, joins bowl
])
# t
G("t", 360, [rect(120, 0, 120+ST, CAP-120), h_bar(30, 330, XH-STH),
             [("m", 120+ST, 40), ("c", 130, -20, 250, -20, 330, 30), ("l", 300, 110),
              ("c", 250, 70, 212, 80, 212, 140), ("l", 212, XH)]])
# f
G("f", 340, [rect(150, 0, 150+ST, CAP-110), h_bar(40, 340, XH-STH),
             [("m", 150, CAP-110), ("c", 150, CAP+20, 260, CAP+40, 330, CAP-10),
              ("l", 300, CAP-90), ("c", 270, CAP-55, 242, CAP-60, 242, CAP-150)]])
# k
G("k", 540, [v_stem(70, 0, CAP),
             [("m", 162, XH*0.42), ("l", 380, XH), ("l", 490, XH), ("l", 250, XH*0.38), ("l", 162, XH*0.38)],
             [("m", 270, XH*0.40), ("l", 360, XH*0.30), ("l", 510, 0), ("l", 400, 0), ("l", 200, XH*0.40)]])
# v
G("v", 520, [[("m", 40, XH), ("l", 150, XH), ("l", 260, 120), ("l", 370, XH), ("l", 480, XH),
              ("l", 310, 0), ("l", 210, 0)]])
# w
G("w", 760, [[("m", 30, XH), ("l", 130, XH), ("l", 210, 130), ("l", 290, XH), ("l", 380, XH),
              ("l", 270, 0), ("l", 175, 0)],
             [("m", 380, XH), ("l", 470, XH), ("l", 555, 130), ("l", 640, XH), ("l", 730, XH),
              ("l", 590, 0), ("l", 495, 0)]])
# x
G("x", 520, [[("m", 40, XH), ("l", 150, XH), ("l", 480, 0), ("l", 370, 0), ("l", 40, XH-1)],
             [("m", 370, XH), ("l", 480, XH), ("l", 150, 0), ("l", 40, 0), ("l", 370, XH-1)]])
# clean x
G("x", 520, [[("m", 45, XH), ("l", 150, XH), ("l", 260, XH*0.62), ("l", 370, XH), ("l", 475, XH),
              ("l", 315, XH/2), ("l", 205, XH/2)],
             [("m", 205, XH/2), ("l", 315, XH/2), ("l", 475, 0), ("l", 370, 0), ("l", 260, XH*0.38),
              ("l", 150, 0), ("l", 45, 0), ("l", 205, XH/2)]])
# y
G("y", 540, [[("m", 40, XH), ("l", 150, XH), ("l", 275, 140), ("l", 400, XH), ("l", 510, XH),
              ("l", 300, -40), ("c", 270, -140, 180, -200, 60, -190), ("l", 60, -110),
              ("c", 150, -115, 200, -80, 225, 0), ("l", 235, 30)]])
# z
G("z", 520, [rect(60, XH-STH, 460, XH), rect(60, 0, 460, STH),
             [("m", 380, XH-STH), ("l", 460, XH-STH), ("l", 140, STH), ("l", 60, STH)]])
# s (scaled S)
sadv, spaths = GLYPHS["S"]
def scale_contours(contours, sx, sy, dx=0, dy=0):
    out = []
    for c in contours:
        nc = []
        for seg in c:
            t = seg[0]; nums = list(seg[1:])
            nn = []
            for i, v in enumerate(nums):
                nn.append(v * (sx if i % 2 == 0 else sy) + (dx if i % 2 == 0 else dy))
            nc.append((t, *nn))
        out.append(nc)
    return out
G("s", 500, scale_contours(spaths, 500/620, XH/CAP))

# g (single storey with descender loop) — build from o + tail
G("g", 570, [
    ring(290, XH/2, 210, XH/2), ring(290, XH/2, 210-ST, XH/2-ST, cw=True),
    [("m", 500-ST, XH), ("l", 500, XH), ("l", 500, -60),
     ("c", 500, -150, 420, -210, 300, -210),
     ("c", 200, -210, 130, -170, 100, -100), ("l", 185, -60),
     ("c", 205, -110, 245, -135, 305, -135),
     ("c", 400, -135, 500-ST, -120, 500-ST, -40)],
])

# ---------- digits ----------
G("0", 600, [ring(300, CAP/2, 230, CAP/2), ring(300, CAP/2, 230-ST, CAP/2-ST, cw=True),
             rect(300-24, CAP/2-70, 300+24, CAP/2+70)])   # slashed zero dot->bar
# cleaner 0 (no slash, oval)
G("0", 600, [ring(300, CAP/2, 220, CAP/2), ring(300, CAP/2, 220-ST, CAP/2-ST, cw=True)])
# 1
G("1", 460, [rect(230, 0, 230+ST, CAP),
             [("m", 230, CAP), ("l", 322, CAP), ("l", 322, CAP-40), ("l", 120, CAP-140),
              ("l", 120, CAP-40)], rect(150, 0, 400, STH)])
# 2
G("2", 560, [[
    ("m", 70, CAP-160),
    ("c", 70, CAP-40, 180, CAP+20, 300, CAP+20),
    ("c", 430, CAP+20, 510, CAP-70, 510, CAP-190),
    ("c", 510, CAP-300, 430, CAP-360, 300, CAP-450),
    ("c", 210, CAP-515, 175, CAP-540, 175, 90), ("l", 510, 90), ("l", 510, 0), ("l", 60, 0),
    ("c", 60, CAP-470, 120, CAP-430, 250, CAP-340),
    ("c", 360, CAP-265, 415, CAP-260, 415, CAP-190),
    ("c", 415, CAP-120, 370, CAP-70, 300, CAP-70),
    ("c", 230, CAP-70, 165, CAP-120, 165, CAP-190), ("l", 70, CAP-160),
]])
# 3
G("3", 560, [[
    ("m", 80, CAP-140), ("c", 110, CAP-40, 200, CAP+20, 300, CAP+20),
    ("c", 430, CAP+20, 500, CAP-60, 500, CAP-160),
    ("c", 500, CAP-250, 440, CAP-300, 360, CAP-320),
    ("c", 450, CAP-345, 520, CAP-405, 520, 200),
    ("c", 520, 70, 430, -20, 295, -20),
    ("c", 180, -20, 95, 40, 70, 150), ("l", 160, 180),
    ("c", 180, 100, 230, 65, 300, 65),
    ("c", 375, 65, 425, 110, 425, 195),
    ("c", 425, 285, 370, 330, 250, 330), ("l", 250, 415),
    ("c", 355, 415, 405, 450, 405, CAP-165),
    ("c", 405, CAP-95, 360, CAP-70, 300, CAP-70),
    ("c", 235, CAP-70, 195, CAP-110, 170, CAP-170),
]])
# 4
G("4", 580, [rect(370, 0, 370+ST, CAP), h_bar(50, 540, 180),
             [("m", 370, CAP), ("l", 300, CAP), ("l", 50, 220), ("l", 50, 300), ("l", 370, CAP-60)]])
# clean 4
G("4", 580, [rect(360, 0, 360+ST, CAP),
             [("m", 360, CAP), ("l", 290, CAP), ("l", 40, 210), ("l", 40, 300),
              ("l", 500, 300), ("l", 500, 210), ("l", 360, 210)]])
# 5
G("5", 560, [rect(110, CAP-STH, 500, CAP), rect(110, CAP-330, 110+ST, CAP),
             [("m", 110, CAP-330), ("c", 200, CAP-280, 480, CAP-320, 500, CAP-540+CAP-540),
              ("l", 500, CAP-540)]])
# robust 5
G("5", 560, [rect(120, CAP-STH, 510, CAP), rect(120, CAP-320, 120+ST, CAP),
             [("m", 120+ST, CAP-320+40),
              ("c", 230, CAP-250, 470, CAP-300, 470, 220),
              ("c", 470, 100, 380, 55, 290, 55),
              ("c", 205, 55, 150, 100, 125, 175), ("l", 45, 140),
              ("c", 85, 30, 190, -20, 300, -20),
              ("c", 440, -20, 560, 60, 560, 220),
              ("c", 560, 380, 430, 430, 120+ST, CAP-320-30)]])
# 6
G("6", 560, [
    ring(290, 190, 200, 190), ring(290, 190, 200-ST, 190-ST, cw=True),
    [("m", 490, CAP-140), ("c", 450, CAP-40, 360, CAP+20, 270, CAP+20),
     ("c", 130, CAP+20, 60, CAP-120, 60, CAP/2-30), ("l", 150, CAP/2-30),
     ("c", 150, CAP-160, 195, CAP-70, 275, CAP-70),
     ("c", 335, CAP-70, 385, CAP-110, 410, CAP-165)],
])
# 7
G("7", 540, [h_bar(50, 500, CAP-STH),
             [("m", 500, CAP-STH), ("l", 500, CAP-60), ("l", 230, 0), ("l", 120, 0),
              ("l", 410, CAP-STH)]])
# 8
G("8", 560, [ring(285, CAP-200, 175, 175), ring(285, CAP-200, 175-ST, 175-ST, cw=True),
             ring(285, 180, 205, 180), ring(285, 180, 205-ST, 180-ST, cw=True)])
# 9  (rotated 6)
G("9", 560, [
    ring(275, CAP-190, 200, 190), ring(275, CAP-190, 200-ST, 190-ST, cw=True),
    [("m", 70, 140), ("c", 110, 40, 205, -20, 295, -20),
     ("c", 435, -20, 505, 120, 505, CAP/2+30), ("l", 415, CAP/2+30),
     ("c", 415, 160, 370, 70, 290, 70),
     ("c", 230, 70, 180, 110, 155, 165)],
])

# ---------- punctuation ----------
G(".", 260, [dot(130, 60)])
G(",", 260, [[("m", 90, 80), ("l", 190, 80), ("l", 190, -10),
              ("c", 190, -90, 150, -140, 90, -160), ("l", 60, -95),
              ("c", 105, -80, 120, -55, 120, 0), ("l", 90, 0)]])
G(":", 260, [dot(130, 60), dot(130, XH-90)])
G(";", 260, [[("m", 90, 80), ("l", 190, 80), ("l", 190, -10),
              ("c", 190, -90, 150, -140, 90, -160), ("l", 60, -95),
              ("c", 105, -80, 120, -55, 120, 0), ("l", 90, 0)], dot(130, XH-90)])
G("!", 260, [rect(130-ST/2, 200, 130+ST/2, CAP), dot(130, 60)])
G("?", 480, [dot(230, 60),
             [("m", 60, CAP-140), ("c", 60, CAP-30, 160, CAP+20, 260, CAP+20),
              ("c", 400, CAP+20, 460, CAP-70, 460, CAP-180),
              ("c", 460, CAP-300, 360, CAP-330, 300, CAP-390),
              ("c", 265, CAP-425, 265, CAP-440, 265, 250), ("l", 185, 250),
              ("c", 185, CAP-410, 200, CAP-430, 260, CAP-470),
              ("c", 330, CAP-410, 365, CAP-290, 365, CAP-180),
              ("c", 365, CAP-110, 320, CAP-70, 260, CAP-70),
              ("c", 200, CAP-70, 150, CAP-120, 150, CAP-170)]])
G("-", 380, [h_bar(60, 320, XH/2 - STH/2)])
G("–", 500, [h_bar(60, 440, XH/2 - STH/2)])   # en dash
G("—", 700, [h_bar(60, 640, XH/2 - STH/2)])   # em dash
G("•", 340, [dot(170, XH/2, 70)])             # bullet
G("(", 300, [[("m", 240, CAP+40), ("c", 90, CAP-100, 90, DESC+100+140, 240, DESC-40),
              ("l", 190, DESC-40+30), ("c", 70, DESC+120, 70, CAP-120, 190, CAP+40+30)]])
# fix ( winding
G("(", 300, [[("m", 235, CAP+30), ("c", 95, CAP-120, 95, 120, 235, -230),
              ("l", 175, -230), ("c", 25, 120, 25, CAP-120, 175, CAP+30)]])
G(")", 300, [[("m", 65, CAP+30), ("c", 205, CAP-120, 205, 120, 65, -230),
              ("l", 125, -230), ("c", 275, 120, 275, CAP-120, 125, CAP+30)]])
G("/", 400, [[("m", 40, -30), ("l", 130, -30), ("l", 400, CAP+30), ("l", 310, CAP+30)]])
# & — a loop-and-tail form (upper eye + lower bowl + kicking tail), monoline
G("&", 660, [
    # upper small ring (the "eye")
    ring(250, CAP-140, 120, 130), ring(250, CAP-140, 120-ST, 130-ST, cw=True),
    # lower larger bowl
    ring(235, 175, 175, 175), ring(235, 175, 175-ST, 175-ST, cw=True),
    # connecting diagonal from eye down through to the flourish, plus kicking tail
    [("m", 250, CAP-270), ("l", 340, CAP-300), ("l", 560, 120),
     ("c", 600, 60, 630, 40, 660, 40), ("l", 660, 130),
     ("c", 610, 130, 585, 160, 545, 215), ("l", 340, 470), ("l", 250, 440)],
])
G("'", 220, [[("m", 80, CAP), ("l", 175, CAP), ("l", 175, CAP-190),
              ("c", 175, CAP-260, 140, CAP-300, 90, CAP-320), ("l", 60, CAP-255),
              ("c", 95, CAP-240, 108, CAP-215, 108, CAP-175), ("l", 80, CAP-175)]])
G('"', 380, [[("m", 80, CAP), ("l", 175, CAP), ("l", 175, CAP-190),
              ("c", 175, CAP-260, 140, CAP-300, 90, CAP-320), ("l", 60, CAP-255),
              ("c", 95, CAP-240, 108, CAP-215, 108, CAP-175), ("l", 80, CAP-175)],
             [("m", 240, CAP), ("l", 335, CAP), ("l", 335, CAP-190),
              ("c", 335, CAP-260, 300, CAP-300, 250, CAP-320), ("l", 220, CAP-255),
              ("c", 255, CAP-240, 268, CAP-215, 268, CAP-175), ("l", 240, CAP-175)]])
G("’", 220, GLYPHS["'"][1])   # right single quote
G("‘", 220, [scale_contours(GLYPHS["'"][1], -1, 1, 220, 0)[i] for i in range(len(GLYPHS["'"][1]))])


# ----------------------------------------------------------------------------
# BUILD
# ----------------------------------------------------------------------------

def build():
    # glyph order + names
    order = [".notdef"] + [ch for ch in GLYPHS]
    def gname(ch):
        if ch == " ": return "space"
        specials = {".": "period", ",": "comma", ":": "colon", ";": "semicolon",
                    "!": "exclam", "?": "question", "-": "hyphen", "/": "slash",
                    "'": "quotesingle", '"': "quotedbl",
                    "–": "endash", "—": "emdash", "•": "bullet",
                    "(": "parenleft", ")": "parenright",
                    "‘": "quoteleft", "’": "quoteright"}
        if ch in specials: return specials[ch]
        if ch.isdigit(): return {"0":"zero","1":"one","2":"two","3":"three","4":"four",
                                 "5":"five","6":"six","7":"seven","8":"eight","9":"nine"}[ch]
        if ch.isalpha():
            return (ch + ".uc") if ch.isupper() else ch  # keep unique names
        return "uni%04X" % ord(ch)

    glyph_order = [".notdef"] + [gname(ch) for ch in GLYPHS]

    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(glyph_order)

    cmap = {}
    for ch in GLYPHS:
        cmap[ord(ch)] = gname(ch)
    fb.setupCharacterMap(cmap)

    glyphs = {}
    metrics = {}

    # helper: draw contours into a TTGlyphPen, converting cubics -> quadratics
    CU2QU_TOLERANCE = 1.0  # font units; well below visible threshold at 1000 upm
    def make_glyph(contours):
        tt = TTGlyphPen(None)
        cu = Cu2QuPen(tt, CU2QU_TOLERANCE)
        draw(cu, contours)
        return tt.glyph()

    # .notdef box (straight lines only)
    glyphs[".notdef"] = make_glyph([rect(80, 0, 520, CAP), hole(150, 70, 450, CAP-70)])
    metrics[".notdef"] = (600, 80)

    for ch, (adv, contours) in GLYPHS.items():
        name = gname(ch)
        glyphs[name] = make_glyph(contours)
        metrics[name] = (adv, 0)  # lsb 0; fontBuilder recomputes bounds

    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASC, descent=DESC)

    name_strings = dict(
        familyName=FAMILY,
        styleName=STYLE,
        uniqueFontIdentifier=f"{FAMILY}-{STYLE};{VERSION}",
        fullName=f"{FAMILY} {STYLE}",
        psName=f"{FAMILY.replace(' ','')}-{STYLE}",
        version=f"Version {VERSION}",
        copyright="Copyright (c) 2026, the india-fiscal-map project. Bharati-INSPIRED "
                  "original design (not the IIT Madras Bharati glyphs). SIL OFL 1.1.",
        designer="india-fiscal-map / procedural build_bharati_font.py",
        description="An original geometric display face inspired by the design "
                    "principles of the Bharati link-script: monoline strokes, open "
                    "counters, and no Devanagari-style top headline bar. Not the IIT "
                    "Madras Bharati glyphs.",
        licenseDescription="Licensed under the SIL Open Font License, Version 1.1.",
    )
    fb.setupNameTable(name_strings)
    fb.setupOS2(sTypoAscender=ASC, sTypoDescender=DESC, usWinAscent=ASC, usWinDescent=-DESC,
                sxHeight=XH, sCapHeight=CAP, achVendID="IFM ")
    fb.setupPost(keepGlyphNames=True)

    # Remove overlaps so intersecting/self-touching contours merge into clean
    # filled shapes (fixes arch-join spurs, stacked bowls, hook overshoots).
    try:
        from fontTools.ttLib.removeOverlaps import removeOverlaps
        removeOverlaps(fb.font)
    except Exception as e:
        print(f"  (removeOverlaps skipped — install skia-pathops: {e})")

    ttf_path = os.path.join(OUT, "BharatiInspired-Regular.ttf")
    fb.save(ttf_path)

    # WOFF2
    from fontTools.ttLib import TTFont
    f = TTFont(ttf_path)
    f.flavor = "woff2"
    woff2_path = os.path.join(OUT, "BharatiInspired-Regular.woff2")
    f.save(woff2_path)

    return ttf_path, woff2_path, len(GLYPHS)


OFL = """Copyright (c) 2026, the india-fiscal-map project (h99311@gmail.com),
with Reserved Font Name "Bharati Inspired".

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is available with a FAQ at: https://openfontlicense.org

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------
(Full text: https://openfontlicense.org/open-font-license-official-text/)

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The fonts,
including any derivative works, can be bundled, embedded, redistributed
and/or sold with any software provided that any reserved names are not used
by derivative works. The fonts and derivatives, however, cannot be released
under any other type of license. The requirement for fonts to remain under
this license does not apply to any document created using the fonts or
their derivatives.
"""

README = """# Bharati Inspired — an original display font

**What it is.** An original geometric display typeface, procedurally built by
`build_bharati_font.py`, and *inspired by* the design principles of the
**Bharati link-script** (V. Srinivasa Chakravarthy & team, IIT Madras): an even
monoline stroke, open humanist counters, and — deliberately — **no
Devanagari-style top headline bar** (the *shirorekha*), for a clean, Latin-like
baseline that reads as a bridge between scripts.

**What it is NOT.** It is **not** a copy of the IIT Madras Bharati glyphs (which
are not released as an open font). Every outline here is drawn from scratch in
the build script. We label it *Bharati-inspired* honestly, the same way the rest
of this project separates an established fact from an interpretation.

**Coverage.** Basic Latin: space, A–Z, a–z, 0–9, and common punctuation. This is
a proof-of-concept set designed on a 1000 upm grid; it can be extended toward the
Devanagari/Brahmic ranges later.

**License.** SIL Open Font License 1.1 — see `OFL.txt`. Free to use, study,
modify and redistribute.

**Rebuild.**
```
python3 -m venv .venv-font
.venv-font/bin/pip install fonttools brotli
.venv-font/bin/python build_bharati_font.py
```
Outputs `BharatiInspired-Regular.ttf` and `.woff2` in this folder.
"""


def main():
    ttf, woff2, n = build()
    with open(os.path.join(OUT, "OFL.txt"), "w") as f:
        f.write(OFL)
    with open(os.path.join(OUT, "README.md"), "w") as f:
        f.write(README)
    for p in (ttf, woff2):
        print(f"  wrote {os.path.relpath(p, HERE)}  ({os.path.getsize(p):,} bytes)")
    print(f"  glyphs: {n} + .notdef")
    print("  license: SIL OFL 1.1")


if __name__ == "__main__":
    main()
