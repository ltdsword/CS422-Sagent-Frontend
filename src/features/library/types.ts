export type VenueDto = {
  id: string;
  name: string;
  venue_type?: string;
  venue_type_display?: string;
};

export type LibraryPaperListDto = {
  id: string;
  title: string;
  year?: number | null;
  referenceCount?: number;
  citationCount?: number;
  venue?: VenueDto | null;
  authors?: string; // serializer returns authors as a single string for list
  pdf_url?: string | null;
};

export type LibraryPaperDetailDto = LibraryPaperListDto & {
  abstract?: string;
  fields?: { id: number; name: string }[];
  extracted_content?: Record<string, unknown> | null;
};
