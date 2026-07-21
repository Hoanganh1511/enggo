Quy ước mới cho các stora dùng chung sau này -- mỗi domain 1 file riêng trong src/stores/ , không gộp chung 1 store khổng lồ. Chỉ chứa đúng 4 field thật sự dùng ở nhiều nơi (allNodes, isPaletteOpen, expandedNodeIds, pendingFocusNodeId)
Quy ước cho các store sau này: 1 file riêng trong src/stores/ cho mỗi domain tính năng, chỉ đưa vào đây những field THẬT SỰ cần nhiều component đọc/ghi state ,
chỉ 1 component dùng thì giữ local (useState), không đưa vào store chung

