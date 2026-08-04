// blurDataURL dung chung cho MOI anh user-upload (post image/gallery/video
// thumbnail, ContentTile) - anh that khong biet truoc mau/kich thuoc nen
// khong the sinh blur rieng tung anh (can server-side generate luc upload,
// chua co ha tang do). SVG shimmer trung tinh 1 mau xam nhat, base64 hard-code
// san (KHONG dung Buffer - file nay import ca vao client component nhu
// MediaBody.tsx, Buffer khong ton tai trong browser runtime).
// Noi dung goc truoc khi encode:
// <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#e5e7eb"/></svg>
export const SHIMMER_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=";
