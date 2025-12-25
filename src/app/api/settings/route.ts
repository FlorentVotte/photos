import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { THEME_PRESETS, DEFAULT_THEME, ThemePresetKey } from "@/lib/themes";
import { requireAuth } from "@/lib/auth";

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";

// GET - Read current settings
export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "default",
          siteTitle: "Photo Portfolio",
          theme: DEFAULT_THEME,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update settings (admin only)
export async function PATCH(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { theme, siteTitle, siteDescription, aboutText } = body;

    const updateData: Record<string, string | null> = {};

    // Validate theme if provided
    if (theme !== undefined) {
      if (!Object.keys(THEME_PRESETS).includes(theme)) {
        return NextResponse.json(
          { error: "Invalid theme preset" },
          { status: 400 }
        );
      }
      updateData.theme = theme;
    }

    if (siteTitle !== undefined) updateData.siteTitle = siteTitle;
    if (siteDescription !== undefined) updateData.siteDescription = siteDescription || null;
    if (aboutText !== undefined) updateData.aboutText = aboutText || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        siteTitle: (updateData.siteTitle as string) || "Photo Portfolio",
        theme: (updateData.theme as ThemePresetKey) || DEFAULT_THEME,
        siteDescription: updateData.siteDescription || null,
        aboutText: updateData.aboutText || null,
      },
    });

    // Revalidate all pages when theme changes to clear the cache
    if (updateData.theme) {
      revalidatePath("/", "layout");
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
