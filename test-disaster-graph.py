import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import os


class DisasterGraphTester:
    def __init__(self):
        self.results = []
        self.screenshot_dir = os.path.join(os.path.dirname(__file__), "test-screenshots")
        os.makedirs(self.screenshot_dir, exist_ok=True)

    async def test_page(self, page, url, disaster_name):
        print(f"\n{'='*80}")
        print(f"开始测试: {disaster_name}")
        print(f"URL: {url}")
        print(f"{'='*80}")

        result = {
            "disaster": disaster_name,
            "url": url,
            "console_errors": [],
            "page_errors": [],
            "visible_text_snippets": [],
            "screenshot_path": "",
            "success": False,
            "graph_loaded": False,
            "load_time": 0,
            "errors": []
        }

        try:
            # 收集控制台错误
            console_messages = []

            def handle_console(msg):
                if msg.type in ["error", "warning"]:
                    console_messages.append({
                        "type": msg.type,
                        "text": msg.text,
                        "location": msg.location.get("url", "unknown")
                    })

            page.on("console", handle_console)

            # 收集页面错误
            page_errors = []

            def handle_page_error(error):
                page_errors.append({
                    "message": str(error),
                    "type": "page_error"
                })

            page.on("pageerror", handle_page_error)

            # 导航到页面
            start_time = datetime.now()
            print(f"\n[1/4] 正在导航到页面...")
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            print(f"  ✓ 页面加载完成")

            # 等待知识图谱加载
            print(f"\n[2/4] 等待知识图谱加载 (60秒)...")
            await asyncio.sleep(60)

            load_time = (datetime.now() - start_time).total_seconds()
            result["load_time"] = load_time
            print(f"  ✓ 等待完成, 总耗时: {load_time:.2f}秒")

            # 检查控制台错误
            print(f"\n[3/4] 检查控制台错误和页面内容...")
            result["console_errors"] = console_messages

            if console_messages:
                print(f"  ⚠ 发现 {len(console_messages)} 条控制台消息:")
                for msg in console_messages[:10]:  # 只显示前10条
                    print(f"    [{msg['type'].upper()}] {msg['text'][:100]}")
                    if len(msg['text']) > 100:
                        print(f"      ... (继续)")
            else:
                print(f"  ✓ 无控制台错误")

            result["page_errors"] = page_errors
            if page_errors:
                print(f"  ⚠ 发现 {len(page_errors)} 条页面错误:")
                for err in page_errors:
                    print(f"    [ERROR] {err['message'][:100]}")
            else:
                print(f"  ✓ 无页面错误")

            # 检查页面可见文本
            body_text = await page.inner_text("body")
            result["visible_text_snippets"] = body_text[:500]

            # 检查知识图谱是否渲染
            graph_selectors = [
                "canvas",
                "svg",
                "[class*='graph']",
                "[class*='node']",
                "[class*='force']",
                "[class*='d3']",
                "g",
                "path"
            ]

            graph_loaded = False
            for selector in graph_selectors:
                elements = await page.query_selector_all(selector)
                if elements:
                    print(f"  ✓ 发现可能的图谱元素: {selector} ({len(elements)}个)")
                    graph_loaded = True
                    break

            result["graph_loaded"] = graph_loaded

            # 检查页面标题
            page_title = await page.title()
            print(f"  页面标题: {page_title}")

            # 获取页面关键文本
            print(f"\n  页面可见文本 (前300字符):")
            print(f"  {body_text[:300]}")

            # 截图
            print(f"\n[4/4] 正在截图...")
            timestamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
            screenshot_path = os.path.join(
                self.screenshot_dir,
                f"disaster-graph-{disaster_name}-{timestamp}.png"
            )
            await page.screenshot(path=screenshot_path, full_page=True)
            result["screenshot_path"] = screenshot_path
            print(f"  ✓ 截图已保存: {screenshot_path}")

            result["success"] = True

        except Exception as e:
            print(f"\n  ✗ 测试失败: {str(e)}")
            result["errors"].append(str(e))

            # 即使失败也尝试截图
            try:
                timestamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
                screenshot_path = os.path.join(
                    self.screenshot_dir,
                    f"disaster-graph-{disaster_name}-error-{timestamp}.png"
                )
                await page.screenshot(path=screenshot_path, full_page=True)
                result["screenshot_path"] = screenshot_path
                print(f"  ✓ 错误截图已保存: {screenshot_path}")
            except:
                pass

        return result

    async def run_tests(self):
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=False,
                args=["--no-sandbox", "--disable-setuid-sandbox"]
            )

            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080},
                ignore_https_errors=True
            )

            # 启用控制台日志
            await context.tracing.start(screenshots=True, snapshots=True)

            page = await context.new_page()

            # 测试 1: 内涝
            result1 = await self.test_page(
                page,
                "http://localhost:3000/safety/disaster-graph?disaster=内涝",
                "内涝"
            )
            self.results.append(result1)

            # 短暂间隔
            await asyncio.sleep(3)

            # 测试 2: 地震
            result2 = await self.test_page(
                page,
                "http://localhost:3000/safety/disaster-graph?disaster=地震",
                "地震"
            )
            self.results.append(result2)

            await browser.close()

    def generate_report(self):
        print(f"\n\n{'='*80}")
        print(f"测试报告")
        print(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*80}\n")

        for i, result in enumerate(self.results, 1):
            print(f"\n{'-'*80}")
            print(f"测试 {i}: {result['disaster']}")
            print(f"{'-'*80}")
            print(f"URL: {result['url']}")
            print(f"测试状态: {'✓ 成功' if result['success'] else '✗ 失败'}")
            print(f"加载时间: {result['load_time']:.2f}秒")
            print(f"图谱渲染: {'✓ 是' if result['graph_loaded'] else '✗ 未检测到'}")

            if result["console_errors"]:
                print(f"\n控制台错误 ({len(result['console_errors'])}条):")
                for err in result["console_errors"][:5]:
                    print(f"  [{err['type'].upper()}] {err['text'][:150]}")
            else:
                print(f"\n控制台错误: 无")

            if result["page_errors"]:
                print(f"\n页面错误 ({len(result['page_errors'])}条):")
                for err in result["page_errors"]:
                    print(f"  {err['message'][:150]}")
            else:
                print(f"页面错误: 无")

            print(f"\n截图路径: {result['screenshot_path'] if result['screenshot_path'] else '无'}")

        print(f"\n{'='*80}")
        print(f"总结")
        print(f"{'='*80}")
        total = len(self.results)
        success = sum(1 for r in self.results if r["success"])
        graph_loaded = sum(1 for r in self.results if r["graph_loaded"])
        print(f"总测试数: {total}")
        print(f"成功: {success}/{total}")
        print(f"图谱成功渲染: {graph_loaded}/{total}")
        print(f"截图目录: {self.screenshot_dir}")


async def main():
    tester = DisasterGraphTester()
    await tester.run_tests()
    tester.generate_report()


if __name__ == "__main__":
    asyncio.run(main())
