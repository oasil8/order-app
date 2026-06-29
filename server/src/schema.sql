-- 메뉴 테이블
CREATE TABLE IF NOT EXISTS menus (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,
  image_url   VARCHAR(255),
  stock       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 옵션 테이블
CREATE TABLE IF NOT EXISTS options (
  id      SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name    VARCHAR(100) NOT NULL,
  price   INTEGER NOT NULL DEFAULT 0
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  total_price INTEGER NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT '주문 접수',
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 주문 항목 테이블
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id     INTEGER NOT NULL REFERENCES menus(id),
  quantity    INTEGER NOT NULL,
  item_price  INTEGER NOT NULL
);

-- 주문 항목 옵션 테이블
CREATE TABLE IF NOT EXISTS order_item_options (
  id            SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id     INTEGER NOT NULL REFERENCES options(id)
);

-- 초기 메뉴 데이터
INSERT INTO menus (name, description, price, stock) VALUES
  ('아메리카노(ICE)', '얼음이 가득한 시원한 아메리카노', 4000, 10),
  ('아메리카노(HOT)', '따뜻하게 즐기는 클래식 아메리카노', 4000, 10),
  ('카페라떼',       '부드러운 우유와 에스프레소의 조화', 5000, 8),
  ('카푸치노',       '풍성한 우유 거품이 올라간 카푸치노', 5000, 6),
  ('바닐라라떼',     '달콤한 바닐라 향이 가득한 라떼', 5500, 5),
  ('카라멜마키아토', '달콤 쌉싸름한 카라멜과 에스프레소', 5500, 0);

-- 초기 옵션 데이터
INSERT INTO options (menu_id, name, price) VALUES
  (1, '샷 추가', 500), (1, '시럽 추가', 0),
  (2, '샷 추가', 500), (2, '시럽 추가', 0),
  (3, '샷 추가', 500), (3, '시럽 추가', 0),
  (4, '샷 추가', 500), (4, '시럽 추가', 0),
  (5, '샷 추가', 500), (5, '바닐라 시럽 추가', 500),
  (6, '샷 추가', 500), (6, '카라멜 추가', 500);
