import asyncio
from playwright.async_api import async_playwright

async def wait_for_graph(page, timeout_seconds=90, poll_interval=5):
    """等待图谱加载完成，每5秒检查一次'图谱已生成'文本"""
    elapsed = 0
    while elapsed < timeout_seconds:
        try:
            found = await page.locator("text=图谱已生成").count() > 0
            if found:
                return True, elapsed
        except:
            pass
        await asyncio.sleep(poll_interval)
        elapsed += poll_interval
    return False, elapsed

async def test_graph(url, disaster_name, screenshot_path):
    """测试单个知识图谱页面"""
    print(f"\n{'='*60}")
    print(f"测试灾害类型: {disaster_name}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(f"[PageError] {err}"))
        
        print(f"开始加载页面...")
        start_time = asyncio.get_event_loop().time()
        await page.goto(url, wait_until="networkidle", timeout=60000)
        goto_time = asyncio.get_event_loop().time() - start_time
        print(f"页面基础加载完成: {goto_time:.2f}秒")
        
        print(f"等待图谱生成（最多90秒）...")
        success, elapsed = await wait_for_graph(page)
        
        if success:
            print(f"图谱已生成! 等待时间: {elapsed}秒")
        else:
            print(f"超时: 90秒内未检测到'图谱已生成'文本")
        
        visible_text = await page.inner_text("body")
        visible_text = visible_text[:2000]
        
        await page.screenshot(path=screenshot_path, full_page=True)
        print(f"截图已保存: {screenshot_path}")
        
        print(f"\n--- 可见文本摘要 ---")
        print(visible_text[:500])
        
        print(f"\n--- Console Errors ---")
        if console_errors:
            for err in console_errors[:20]:
                print(f"  {err}")
        else:
            print("  无错误")
        
        await browser.close()
        
        return {
            "disaster": disaster_name,
            "url": url,
            "success": success,
            "load_time": elapsed,
            "visible_text": visible_text,
            "console_errors": console_errors,
            "screenshot": screenshot_path
        }

async def main():
    print("知识图谱模块测试开始")
    print(f"测试时间: {asyncio.get_event_loop().time()}")
    
    results = []
    
    result1 = await test_graph(
        "http://localhost:3000/safety/disaster-graph?disaster=内涝",
        "内涝",
        "neilao-graph.png"
    )
    results.append(result1)
    
    result2 = await test_graph(
        "http://localhost:3000/safety/disaster-graph?disaster=地震",
        "地震",
        "dizhen-graph.png"
    )
    results.append(result2)
    
    print(f"\n{'='*60}")
    print("测试报告")
    print(f"{'='*60}")
    
    for r in results:
        print(f"\n灾害类型: {r['disaster']}")
        print(f"加载状态: {'成功' if r['success'] else '失败'}")
        print(f"加载时间: {r['load_time']}秒")
        print(f"截图: {r['screenshot']}")
        print(f"错误数量: {len(r['console_errors'])}")
        if r['console_errors']:
            print("错误详情:")
            for err in r['console_errors'][:5]:
                print(f"  - {err}")

if __name__ == "__main__":
    asyncio.run(main())