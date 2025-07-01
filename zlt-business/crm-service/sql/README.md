# CRM鏈嶅姟鏁版嵁鍒濆鍖栬鏄?

## 姒傝堪
鏈洰褰曞寘鍚獵RM鏈嶅姟鐨勬暟鎹簱鍒濆鍖栬剼鏈紝宸插皢绉熸埛ID淇涓?default"銆?

## 鏂囦欢璇存槑

### 1. crm_init.sql
- **鐢ㄩ€?*: 鍒涘缓CRM鏁版嵁搴撹〃缁撴瀯
- **鍐呭**: 鍖呭惈鎵€鏈塁RM涓氬姟琛ㄧ殑DDL璇彞

### 2. crm_init_data.sql  
- **鐢ㄩ€?*: 鎻掑叆鍒濆娴嬭瘯鏁版嵁
- **绉熸埛ID**: 浣跨敤 "default" 浣滀负榛樿绉熸埛
- **鏁版嵁閲?*: 12涓鎴枫€?0涓晢鏈恒€?2鏉¤窡杩涜褰曠瓑

## 鎵ц姝ラ

1. 鍒涘缓鏁版嵁搴擄細`CREATE DATABASE central_crm;`
2. 鎵ц琛ㄧ粨鏋勶細`mysql -u root -plengfeng847 central_crm < crm_init.sql`
3. 鎵ц鍒濆鏁版嵁锛歚mysql -u root -plengfeng847 central_crm < crm_init_data.sql`

## 鏁版嵁楠岃瘉

```sql
-- 楠岃瘉鏁版嵁
SELECT COUNT(*) FROM customer WHERE tenant_id = 'default';
SELECT COUNT(*) FROM opportunity WHERE tenant_id = 'default';
```

棰勬湡缁撴灉锛氬鎴?2鏉★紝鍟嗘満10鏉★紝绉熸埛ID鍧囦负"default"銆
