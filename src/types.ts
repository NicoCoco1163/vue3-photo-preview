export type ItemType = {
  // 唯一标识
  key: string;
  // 图片地址
  src: string;
  // 控住图片显示的节点
  originRef?: HTMLElement | null;
  // 图片介绍
  intro?: string | null;
  // 图片下载名称
  downloadName?: string | null;
  // 缩略图地址
  thumbnailSrc?: string | null;
}

export type OriginRectType = {
  left: number;
  top: number;
  width: number;
  height: number;
} | null;

export type UpdateItemType = (item: ItemType) => void;

export type RemoveItemType = (key: string) => void;

export type HandleShowType = (key: string) => void;

export type updateIndexType = (key: number) => void;

// 动画类型
export enum ShowAnimateEnum {
  None,
  In,
  Out,
}

// 触摸状态
export enum TouchTypeEnum {
  Normal,
  X, // x 轴只能水平切换图片
  Y, // y 轴只能撤销图片
  Scale, // 缩放模式
}

// 边缘状态
export enum EdgeTypeEnum {
  Left,
  Right,
  Top,
  Bottom,
}

// Provider 参数
export type PhotoProviderProps = {
  // 图片点击是否关闭
  photoClosable: boolean;
  // 背景点击是否关闭
  maskClosable: boolean;
  // 箭头切换是否需要过渡
  shouldTransition: boolean;
  // 默认背景透明度
  defaultBackdropOpacity: number;
  // 非全屏模式
  showInComponent: boolean;
  // 禁止双击
  disableDoubleTap: boolean;
  // 隐藏工具栏
  alwaysHideBanner: boolean;
  // 隐藏左侧缩略图
  alwaysHideSlider: boolean;
  // 是否循环显示预览图
  loop: boolean;
  // 下载图片方法，不传使用内置的下载方法
  onDownload: (item: ItemType) => void | null;
  // 打印
  onPrint: (item: ItemType) => void | null;
}

export type PhototProviderReturnProps = {
  visible: boolean;
  index: number;
  updateIndex: (newIndex: number) => void;
  [key: string]: unknown;
}
