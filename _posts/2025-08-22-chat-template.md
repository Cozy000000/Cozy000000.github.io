<!-- ---
layout: post
title: '大模型对话格式全景'
date: 2025-08-22 11:00:00 +0800
categories: tech
---

# 大模型对话格式全景：从 Chat Template 到 Tool-Use，再到跨阶段 Token 设计的深度拆解

> 一句话总结：Chat Template 是“把结构化对话转成模型可 tokenize 的字符串”的模板引擎；Tool-Use 模板在此基础上增加了函数调用协议；预训练与 SFT 阶段之所以出现不同的特殊 token，是因为“结束”语义从单一走向多元。

---

## 1. Chat Template：对话系统的格式契约

### 1.1 为什么必须存在
- 不同模型在训练时采用了**互不兼容**的文本格式  
  - Mistral：`[INST] xxx [/INST]`  
  - Qwen：`<|im_start|>user\nxxx<|im_end|>`  
- 任何细微差异都会因分布漂移导致**回答质量骤降**  
- 因此需要“**一次性声明格式，全生命周期复用**”的机制

### 1.2 技术实现
- 存储位置：Tokenizer 配置中的 `chat_template` 字段  
- 语法：Jinja2 模板，支持 `if/for/macro` 等逻辑  
- 入口 API：`tokenizer.apply_chat_template(messages, tools=..., add_generation_prompt=...)`

```python
prompt = tokenizer.apply_chat_template(
    messages=[
        {"role": "user", "content": "9.11 和 9.9 哪个大？"}
    ],
    add_generation_prompt=True,
    tokenize=False
)
# <s>[INST] 9.11 和 9.9 哪个大？ [/INST]
```

---

## 2. Tool-Use Chat Template：把函数调用文本化

| 维度 | 普通模板 | Tool-Use 模板 |
|---|---|---|
| 角色集合 | {user, assistant, system} | 增加 `{tool_calls, tool}` |
| 新增字段 | — | `tool_calls`, `tool_call_id`, `tools` |
| 模板片段 | 循环输出 `role: content` | 额外注入 `<|tools|>JSON<|/tools|>` 与 `<tool_call>JSON</tool_call>` |
| 解析动作 | 直接继续生成 | 遇 `<tool_call>` 停、调 API、回传 `role=tool` 后继续 |

### 2.1 典型流程
1. 用户输入  
2. 模板拼接函数签名 → `<|tools|>[...]<|/tools|>`  
3. 模型输出 `<tool_call>` JSON  
4. 外部执行函数 → 结果写回 `role=tool`  
5. 再次进入模板 → 继续生成自然语言回答

### 2.2 示例
```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "parameters": {"location": {"type": "string"}}
    }
}]
prompt = tokenizer.apply_chat_template(
    messages=messages,
    tools=tools,
    add_generation_prompt=True,
    tokenize=False
)
```

---

## 3. 预训练 vs SFT：Token 语义的分化史

| 阶段 | 任务 | 所需“结束”语义 | 典型 Token |
|---|---|---|---|
| Pretrain | 文档级 LM | 全文结束 | `<|end_of_sequence|>` / `<|endoftext|>` |
| SFT | 多轮对话 | 单轮角色结束 + 全文结束 | `<|im_end|>` + `<|endoftext|>` |
| Tool-use SFT | 函数调用 | 工具片段结束 + 角色结束 + 全文结束 | `<|im_end|>` / `<|tool_end|>` + `<|endoftext|>` |

### 3.1 为什么不用同一个 eos 复用？
- **语义冲突**：单一 token 承担多种边界 ⇒ 模型分布漂移  
- **解析困难**：下游需额外正则区分“句子完”还是“全文完”  
- **成本极低**：新增 1~3 个 id 即可换取鲁棒性与可解析性

---

## 4. 工程速查表

| 任务 | 代码片段 |
|---|---|
| 普通推理 | `tok.apply_chat_template(messages, add_generation_prompt=True)` |
| 工具推理 | `tok.apply_chat_template(messages, tools=tools, add_generation_prompt=True)` |
| 训练集预处理 | `tok.apply_chat_template(chat, add_generation_prompt=False, tokenize=False)` |
| 自定义模板 | `tok.chat_template = "{% raw %}{% ... %}{% endraw %}"` |

---

## 5. 结论

1. **Chat Template = 对话格式 DSL**：一次编写，推理/训练/微调全通用。  
2. **Tool-Use 模板 = 在 DSL 里新增函数调用语法**，让模型输出可执行代码。  
3. **Token 演化 = 语义维度膨胀**：从“句子结束”到“角色结束、工具结束、文档结束”，每新增一种边界就引入一个不可冲突的特殊符号。

掌握这三层，就可以把任何开源模型安全、无损、可扩展地接入对话或 Agent 系统。 -->
