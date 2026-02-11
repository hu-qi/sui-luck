MVP 目标

在最小实现下，让评委看到：
活动是对象
参与是对象
结果是对象
执行过程可重放
多个活动可并行存在

一、必须实现的链上对象

ActivityPool
字段：id, creator, start_time, end_time, status, rules_ref_list, reward_vault_ref

ParticipationTicket
字段：id, pool_id, owner, minted_at

RewardRule
只实现一种最简单规则即可

RewardResult
字段：id, pool_id, randomness_input, tickets_commitment, rules_commitment, result

二、必须实现的链上函数

create_pool
add_rule
fund_pool
participate
close_pool
execute_distribution

三、随机输入方案

randomness_input = hash(
pool_id,
close_tx_digest,
user_supplied_seed
)

随机输入写入 RewardResult，用于重放。

四、最小分配算法

单一中奖者
或 Top K 中奖者

五、执行过程承诺

tickets_commitment
对排序后的 ticket id 列表做 hash

rules_commitment
对规则集合做 hash

六、前端最小页面

活动列表页
活动详情页
参与组件
结果页
重放面板

七、Demo 最小剧本

创建两个活动池
参与并生成凭证
关闭并执行其中一个
重放执行过程
展示另一个仍在进行中

八、明确延后实现

复杂规则
VRF
复杂赞助逻辑
二级市场
