INSERT OR IGNORE INTO products VALUES
('king','King',600,'one-time','♛','5 Minute Kit Cooldown • 1.5x Tokens Per Kill • 2 Tokens every 5 minutes in the AFK Zone.','["5 Minute Kit Cooldown","1.5x Tokens Per Kill","2 Tokens every 5 minutes in AFK Zone"]','lp user {player} parent set king',1,datetime('now'),datetime('now')),
('god','God',1200,'one-time','✦','5 Minute Kit Cooldown • 1.75x Tokens Per Kill • 4 Tokens every 5 minutes in the AFK Zone.','["5 Minute Kit Cooldown","1.75x Tokens Per Kill","4 Tokens every 5 minutes in AFK Zone"]','lp user {player} parent set god',1,datetime('now'),datetime('now')),
('immortal','Immortal Demon',1800,'one-time','∞','No Kit Cooldown • 2x Tokens Per Kill • 5 Tokens every 5 minutes in the AFK Zone.','["No Kit Cooldown","2x Tokens Per Kill","5 Tokens every 5 minutes in AFK Zone"]','lp user {player} parent set immortal',1,datetime('now'),datetime('now')),
('tokens1','1,000 Tokens',300,'one-time','◆','Add 1,000 tokens to your Unstable FFA balance.','[]','tokenadmin give {player} 1000',1,datetime('now'),datetime('now')),
('tokens2','5,000 Tokens',1000,'one-time','◆','Add 5,000 tokens to your balance.','[]','tokenadmin give {player} 5000',1,datetime('now'),datetime('now')),
('tokens3','15,000 Tokens',2500,'one-time','◆','Add 15,000 tokens to your balance.','[]','tokenadmin give {player} 15000',1,datetime('now'),datetime('now')),
('key1','Crate Key',200,'one-time','🔑','One key for an OCE crate.','[]','',0,datetime('now'),datetime('now')),
('key5','5 Crate Keys',800,'one-time','🔑','Five crate keys at a bundle price.','[]','',0,datetime('now'),datetime('now')),
('key15','15 Crate Keys',2000,'one-time','🔑','Fifteen crate keys for Unstable FFA OCE.','[]','',0,datetime('now'),datetime('now')),
('item1','Special Item',500,'one-time','★','A special Unstable FFA OCE item.','[]','',0,datetime('now'),datetime('now')),
('item2','Premium Item',1000,'one-time','✦','A premium special item.','[]','',0,datetime('now'),datetime('now')),
('item3','Ultimate Item',1800,'one-time','☄','An exclusive ultimate item.','[]','',0,datetime('now'),datetime('now'));
INSERT OR IGNORE INTO settings VALUES ('server_ip','ocenetwork.org');
INSERT OR IGNORE INTO settings VALUES ('discord_url','#');
