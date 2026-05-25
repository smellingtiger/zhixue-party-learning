import asyncio
from playwright.async_api import async_playwright
import os
import json
from datetime import datetime

BASE_URL = "http://localhost:3000/safety/disaster-graph"
DISASTERS = {
    "内涝": "内涝",
    "台风": "台风",
    "地震": "地震",
    "森林火灾": "森林火灾",
    "寒潮": "寒潮"
}
SCREENSHOT_DIR = "test_screenshots"
RESULTS_FILE = "disaster_test_results.json"

async def test_disaster_module(page, disaster_name, disaster_param):
    url = f"{BASE_URL}?disaster={disaster_param}"
    result = {
        "disaster": disaster_name,
        "url": url,
        "load_success": False,
        "visible_content": "",
        "console_errors": [],
        "screenshot_path": "",
        "errors": []
    }

    try:
        # 收集控制台错误
        console_errors = []
        def on_console(msg):
            if msg.type == "error":
                console_errors.append(msg.text)
        page.on("console", on_console)

        # 导航到页面
        await page.goto(url, wait_until="networkidle")

        # 等待5秒让页面渲染完成
        await asyncio.sleep(5)

        # 检查可见文本
        visible_text = await page.inner_text("body")

        # 检查成功指标
        success_indicators = ["图谱已加载", "知识图谱", "图谱", "加载"]
        has_success = any(indicator in visible_text for indicator in success_indicators)

        result["load_success"] = has_success
        result["visible_content"] = visible_text[:500]  # 截取前500字符
        result["console_errors"] = console_errors

        # 截图
        screenshot_path = os.path.join(SCREENSHOT_DIR, f"{disaster_param}_graph.png")
        await page.screenshot(path=screenshot_path, full_page=True)
        result["screenshot_path"] = screenshot_path

        print(f"✓ [{disaster_name}] 测试完成")
        print(f"  - 加载成功: {'是' if has_success else '否'}")
        print(f"  - 控制台错误: {len(console_errors)} 个")
        print(f"  - 截图路径: {screenshot_path}")
        print(f"  - 可见内容摘要: {visible_text[:200]}...")
        print()

    except Exception as e:
        result["errors"].append(str(e))
        print(f"✗ [{disaster_name}] 测试失败: {e}")

    return result

async def main():
    print("=" * 60)
    print("灾害知识图谱模块测试")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    # 创建截图目录
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        all_results = []

        for disaster_name, disaster_param in DISASTERS.items():
            print(f"正在测试: {disaster_name}")
            result = await test_disaster_module(page, disaster_name, disaster_param)
            all_results.append(result)

        await browser.close()

    # 汇总结果
    print("=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    print()

    success_count = 0
    for result in all_results:
        status = "✓ 成功" if result["load_success"] else "✗ 失败"
        if result["load_success"]:
            success_count += 1

        print(f"{result['disaster']}: {status}")
        print(f"  - URL: {result['url']}")
        print(f"  - 加载成功: {'是' if result['load_success'] else '否'}")

        if result["console_errors"]:
            print(f"  - 控制台错误:")
            for err in result["console_errors"][:3]:  # 只显示前3个错误
                print(f"    • {err}")

        if result["errors"]:
            print(f"  - 异常:")
            for err in result["errors"]:
                print(f"    • {err}")

        print(f"  - 截图: {result['screenshot_path']}")
        print(f"  - 可见内容: {result['visible_content'][:150]}...")
        print()

    # 保存结果到JSON
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "test_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total": len(all_results),
            "success": success_count,
            "failed": len(all_results) - success_count,
            "results": all_results
        }, f, ensure_ascii=False, indent=2)

    print(f"测试结果已保存到: {RESULTS_FILE}")
    print(f"\n总计: {len(all_results)} 个模块")
    print(f"成功: {success_count} 个")
    print(f"失败: {len(all_results) - success_count} 个")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
