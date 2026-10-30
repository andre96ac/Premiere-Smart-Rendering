

/**
 * Tipi per il JSON generato da fast-xml-parser
 * a partire da un XML xmeml di Premiere Pro.
 */

export type XmlBoolean = "TRUE" | "FALSE";
export type XmlAttribute = string;

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

export interface XmlPremiereFile {
  "?xml"?: {
    "@_version": string;
    "@_encoding": string;
  };
  xmeml: Xmeml;
}

export interface Xmeml {
  "@_version": string;
  project: Project;
}

export interface Project {
  name: string;
  children: ProjectChildren;
}

export interface ProjectChildren {
  sequence: Sequence[];
  clip: MasterClip[];
}

// -----------------------------------------------------------------------------
// Rate e timecode
// -----------------------------------------------------------------------------

export interface FrameRate {
  timebase: number;
  ntsc: XmlBoolean;
}

export interface Timecode {
  rate: FrameRate;
  string: string;
  frame: number;
  displayformat: string;
}

// -----------------------------------------------------------------------------
// Sequence
// -----------------------------------------------------------------------------

export interface Sequence {
  uuid: string;
  duration: number;
  rate: FrameRate;
  name: string;
  media: SequenceMedia;
  timecode: Timecode;
  labels: Labels;
  logginginfo: LoggingInfo;

  "@_id": string;
  "@_TL.SQAudioVisibleBase"?: string;
  "@_TL.SQVideoVisibleBase"?: string;
  "@_TL.SQVisibleBaseTime"?: string;
  "@_TL.SQAVDividerPosition"?: string;
  "@_TL.SQHideShyTracks"?: string;
  "@_TL.SQHeaderWidth"?: string;
  "@_TL.SQDataTrackViewControlState"?: string;
  "@_Monitor.ProgramZoomOut"?: string;
  "@_Monitor.ProgramZoomIn"?: string;
  "@_TL.SQTimePerPixel"?: string;
  "@_MZ.EditLine"?: string;
  "@_MZ.Sequence.PreviewFrameSizeHeight"?: string;
  "@_MZ.Sequence.PreviewFrameSizeWidth"?: string;
  "@_MZ.Sequence.AudioTimeDisplayFormat"?: string;
  "@_MZ.Sequence.PreviewRenderingClassID"?: string;
  "@_MZ.Sequence.PreviewRenderingPresetCodec"?: string;
  "@_MZ.Sequence.PreviewRenderingPresetPath"?: string;
  "@_MZ.Sequence.PreviewUseMaxRenderQuality"?: string;
  "@_MZ.Sequence.PreviewUseMaxBitDepth"?: string;
  "@_MZ.Sequence.EditingModeGUID"?: string;
  "@_MZ.Sequence.VideoTimeDisplayFormat"?: string;
  "@_MZ.WorkOutPoint"?: string;
  "@_MZ.WorkInPoint"?: string;
  "@_explodedTracks"?: string;
}

// -----------------------------------------------------------------------------
// Media della sequenza
// -----------------------------------------------------------------------------

export interface SequenceMedia {
  video: SequenceVideo;
  audio: SequenceAudio;
}

export interface SequenceVideo {
  format: VideoFormat;
  track: VideoTrack[];
}

export interface VideoFormat {
  samplecharacteristics: VideoSampleCharacteristics;
}

export interface VideoSampleCharacteristics {
  rate: FrameRate;
  codec: Codec;
  width: number;
  height: number;
  anamorphic: XmlBoolean;
  pixelaspectratio: string;
  fielddominance: string;
  colordepth: number;
}

export interface Codec {
  name: string;
  appspecificdata: {
    appname: string;
    appmanufacturer: string;
    appversion: number;
    data: {
      qtcodec: {
        codecname: string;
        codectypename: string;
        codectypecode: string;
        codecvendorcode: string;
        spatialquality: number;
        temporalquality: number;
        keyframerate: number;
        datarate: number;
      };
    };
  };
}

export interface SequenceAudio {
  numOutputChannels: number;
  format: {
    samplecharacteristics: AudioSampleCharacteristics;
  };
  outputs: {
    group: AudioOutputGroup[];
  };
}

export interface AudioOutputGroup {
  index: number;
  numchannels: number;
  downmix: number;
  channel: {
    index: number;
  };
}

export interface AudioSampleCharacteristics {
  depth: number;
  samplerate: number;
}

// -----------------------------------------------------------------------------
// Tracce video e audio
// -----------------------------------------------------------------------------

export interface TrackBase {
  enabled: XmlBoolean;
  locked: XmlBoolean;

  "@_TL.SQTrackShy"?: string;
  "@_TL.SQTrackExpandedHeight"?: string;
  "@_TL.SQTrackExpanded"?: string;
  "@_MZ.TrackTargeted"?: string;
}

export interface VideoTrack extends TrackBase {
  clipitem?: SequenceClipItem[];
}

export interface AudioTrack extends TrackBase {
  clipitem?: SequenceClipItem[];
  outputchannelindex?: number;

  "@_TL.SQTrackAudioKeyframeStyle"?: string;
  "@_PannerCurrentValue"?: string;
  "@_PannerIsInverted"?: string;
  "@_PannerStartKeyframe"?: string;
  "@_PannerName"?: string;
  "@_currentExplodedTrackIndex"?: string;
  "@_totalExplodedTrackCount"?: string;
  "@_premiereTrackType"?: string;
}

export interface Sourcetrack {
  mediatype: "audio" | "video";
  trackindex: number;
}

// -----------------------------------------------------------------------------
// Clipitem nella timeline
// -----------------------------------------------------------------------------

export interface SequenceClipItem {
  masterclipid: string;
  name: string;
  enabled?: XmlBoolean;
  duration?: number;
  rate: FrameRate;
  start?: number;
  end?: number;
  in?: number;
  out?: number;
  pproTicksIn?: number;
  pproTicksOut?: number;
  alphatype?: string;
  pixelaspectratio?: string;
  anamorphic?: XmlBoolean;

  file?: MediaFile;
  sourcetrack?: Sourcetrack;
  link?: ClipLink[];

  logginginfo?: LoggingInfo;
  colorinfo?: ColorInfo;
  labels?: Labels;

  "@_id": string;
  "@_premiereChannelType"?: string;
}

export interface ClipLink {
  linkclipref: string;
  mediatype: "video" | "audio";
  trackindex: number;
  clipindex: number;
  groupindex?: number;
}

// -----------------------------------------------------------------------------
// File multimediali
// -----------------------------------------------------------------------------

export interface MediaFile {
  name?: string;
  pathurl?: string;
  mediaSource?: string;
  rate?: FrameRate;
  duration?: number;
  timecode?: Timecode;
  media?: FileMedia;

  "@_id": string;
}

export interface FileMedia {
  video?: FileVideoMedia;
  audio?: FileAudioMedia;
}

export interface FileVideoMedia {
  samplecharacteristics: FileVideoSampleCharacteristics;
}

export interface FileVideoSampleCharacteristics {
  rate: FrameRate;
  width: number;
  height: number;
  anamorphic: XmlBoolean;
  pixelaspectratio: string;
  fielddominance: string;
}

export interface FileAudioMedia {
  samplecharacteristics: AudioSampleCharacteristics;
  channelcount: number;
}

// -----------------------------------------------------------------------------
// Master clip del progetto
// -----------------------------------------------------------------------------

export interface MasterClip {
  uuid: string;
  masterclipid: string;
  ismasterclip: XmlBoolean;
  duration: number;
  rate: FrameRate;
  in?: number;
  out?: number;
  name: string;
  media: MasterClipMedia;
  logginginfo: LoggingInfo;
  colorinfo: ColorInfo;
  labels: Labels;

  "@_id": string;
  "@_explodedTracks"?: string;
}

export interface MasterClipMedia {
  video: {
    track: {
      clipitem: MasterClipItem;
    };
  };
  audio?: {
    track: Array<{
      clipitem: MasterClipItem;
    }>;
  };
}

export interface MasterClipItem {
  masterclipid: string;
  name: string;
  rate: FrameRate;
  alphatype?: string;
  pixelaspectratio?: string;
  anamorphic?: XmlBoolean;
  file: MediaFile;
  sourcetrack?: Sourcetrack;
  link?: ClipLink[];
  "@_id": string;
}

// -----------------------------------------------------------------------------
// Metadati condivisi
// -----------------------------------------------------------------------------

export interface LoggingInfo {
  description: string;
  scene: string;
  shottake: string;
  lognote: string;
  good: string;
  originalvideofilename: string;
  originalaudiofilename: string;
}

export interface ColorInfo {
  lut: string;
  lut1: string;
  asc_sop: string;
  asc_sat: string;
  lut2: string;
}

export interface Labels {
  label2: string;
}
