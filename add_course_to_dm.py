import dmPython
import os
import shutil
import uuid
from datetime import datetime

DB_CONFIG = {
    'server': '192.168.1.244',
    'port': 5237,
    'user': 'SYSDBA',
    'password': 'lzGWY@2025',
    'schema': 'TXXY',
}

VIDEO_BASE_PATH = r'E:\社院课程stt'
MP4_FILE_PATH = r'C:\Users\Admin\Downloads\具身智能引论.mp4'
COURSE_NAME = '具身智能引论'
COURSE_TEACHER = '未知'

# 视频时长
VIDEO_DURATION_SECONDS = 279.573
VIDEO_DURATION_MINUTES = VIDEO_DURATION_SECONDS / 60  # 4.66 minutes

def connect_dm():
    conn = dmPython.connect(
        server=DB_CONFIG['server'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
    )
    print(f'成功连接到达梦数据库')
    cursor = conn.cursor()
    cursor.execute(f'SET SCHEMA {DB_CONFIG["schema"]}')
    cursor.close()
    return conn

def get_next_course_id(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT MAX(ID) + 1 FROM TXXY.REPOCOURSE')
    next_id = cursor.fetchone()[0]
    cursor.close()
    return next_id

def get_next_url_id(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT MAX(ID) + 1 FROM TXXY.REPOCOURSEURL')
    next_id = cursor.fetchone()[0]
    cursor.close()
    return next_id

def generate_course_code(course_id):
    now = datetime.now()
    code = f'ZHIXUE{now.strftime("%y%m%d")}{course_id:04d}'
    return code

def copy_video_file():
    # 创建目标目录（如果不存在）
    if not os.path.exists(VIDEO_BASE_PATH):
        os.makedirs(VIDEO_BASE_PATH)
        print(f'创建目录: {VIDEO_BASE_PATH}')

    # 使用 UUID 作为文件名，避免中文路径问题
    file_uuid = str(uuid.uuid4())
    target_filename = f'{file_uuid}.mp4'
    target_path = os.path.join(VIDEO_BASE_PATH, target_filename)

    print(f'复制视频文件...')
    print(f'  源文件: {MP4_FILE_PATH}')
    print(f'  目标文件: {target_path}')
    shutil.copy2(MP4_FILE_PATH, target_path)
    print(f'  复制完成')
    return target_filename

def insert_course(conn):
    course_id = get_next_course_id(conn)
    course_code = generate_course_code(course_id)
    course_uuid = str(uuid.uuid4())
    publish_date = datetime.now()
    job_title = ''

    # 复制视频文件
    video_filename = copy_video_file()

    # 计算 TIME（小时数，后端使用的小时格式）
    time_hours = round(VIDEO_DURATION_SECONDS / 3600, 2)

    print(f'\n插入课程记录到 REPOCOURSE...')
    print(f'  ID: {course_id}')
    print(f'  CODE: {course_code}')
    print(f'  NAME: {COURSE_NAME}')
    print(f'  UUID: {course_uuid}')
    print(f'  DURATION: {VIDEO_DURATION_MINUTES:.1f} 分钟')

    cursor = conn.cursor()
    cursor.execute('SET IDENTITY_INSERT TXXY.REPOCOURSE ON')
    cursor.close()

    sql = """
        INSERT INTO TXXY.REPOCOURSE (
            ID, CODE, NAME, NICKNAME, TEACHER, TYPE, STATUS,
            CREATERID, CREATETIME, CONTENT, IMG, WORDCONTENT,
            SORT, TAG, CLICKCOUNT, DURATION, STANDARDS, JOBTITLE,
            COURSESIZE, PRICE, COURSESOURCETYPE, SECONDTYPE,
            PUBLISHDATE, ORIGINPRICE, ISPAY, ISFREE, UUID, KEYWORD,
            REPOAREAUUID, STAR
        ) VALUES (
            :id, :code, :name, :nickname, :teacher, :type, :status,
            :createrid, :createtime, :content, :img, :wordcontent,
            :sort, :tag, :clickcount, :duration, :standards, :jobtitle,
            :coursesize, :price, :coursesourcetype, :secondtype,
            :publishdate, :originprice, :ispay, :isfree, :uuid, :keyword,
            :repoareauuid, :star
        )
    """

    params = {
        'id': course_id,
        'code': course_code,
        'name': COURSE_NAME,
        'nickname': COURSE_NAME,
        'teacher': COURSE_TEACHER,
        'type': 'SingleCourse',
        'status': 'Publish',
        'createrid': 'admin',
        'createtime': publish_date,
        'content': f'{COURSE_NAME} - 视频课程',
        'img': '',
        'wordcontent': None,
        'sort': None,
        'tag': None,
        'clickcount': 0,
        'duration': VIDEO_DURATION_MINUTES,
        'standards': 'Mp4',
        'jobtitle': job_title,
        'coursesize': None,
        'price': 0.0,
        'coursesourcetype': 'OnlineShareCourse',
        'secondtype': None,
        'publishdate': publish_date,
        'originprice': None,
        'ispay': 1,
        'isfree': 0,
        'uuid': course_uuid,
        'keyword': '理论学习',
        'repoareauuid': 6,
        'star': None,
    }

    cursor = conn.cursor()
    cursor.execute(sql, params)
    conn.commit()
    cursor.close()

    cursor = conn.cursor()
    cursor.execute('SET IDENTITY_INSERT TXXY.REPOCOURSE OFF')
    cursor.close()
    print(f'  REPOCOURSE 插入成功!')

    # 插入视频 URL
    print(f'\n插入视频URL到 REPOCOURSEURL...')

    cursor = conn.cursor()
    cursor.execute('SET IDENTITY_INSERT TXXY.REPOCOURSEURL ON')
    cursor.close()

    for url_type, priority in [('PcPlay', 1), ('MobilePlay', 2)]:
        url_id = get_next_url_id(conn)
        url_sql = """
            INSERT INTO TXXY.REPOCOURSEURL (ID, COURSEID, COURSECODE, URL, NODECOUNT, STATUS, PRIORITY, TYPE, QUALITY)
            VALUES (:id, :courseid, :coursecode, :url, :nodecount, :status, :priority, :type, :quality)
        """
        url_params = {
            'id': url_id,
            'courseid': course_id,
            'coursecode': course_code,
            'url': video_filename,
            'nodecount': None,
            'status': 'Normal',
            'priority': priority,
            'type': url_type,
            'quality': 0,
        }
        cursor = conn.cursor()
        cursor.execute(url_sql, url_params)
        conn.commit()
        cursor.close()
        print(f'  REPOCOURSEURL ({url_type}) 插入成功! ID={url_id}')

    cursor = conn.cursor()
    cursor.execute('SET IDENTITY_INSERT TXXY.REPOCOURSEURL OFF')
    cursor.close()

    return course_id, course_code, video_filename

def verify_insertion(conn, course_id):
    print(f'\n=== 验证插入结果 ===')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM TXXY.REPOCOURSE WHERE ID = :id', {'id': course_id})
    row = cursor.fetchone()
    if row:
        columns = [desc[0] for desc in cursor.description]
        print(f'REPOCOURSE 记录存在:')
        for col, val in zip(columns, row):
            print(f'  {col}: {val}')
    else:
        print('错误: REPOCOURSE 记录不存在!')

    cursor.execute('SELECT * FROM TXXY.REPOCOURSEURL WHERE COURSEID = :id', {'id': course_id})
    urls = cursor.fetchall()
    print(f'\nREPOCOURSEURL 记录 ({len(urls)} 条):')
    for url_row in urls:
        print(f'  {url_row}')
    cursor.close()

def main():
    print(f'任务: 将 "{COURSE_NAME}" MP4 添加到达梦数据库 course 库')
    print(f'视频时长: {VIDEO_DURATION_SECONDS:.2f} 秒 ({VIDEO_DURATION_MINUTES:.2f} 分钟)')
    print(f'视频大小: {os.path.getsize(MP4_FILE_PATH) / (1024*1024):.2f} MB')
    print()

    if not os.path.exists(MP4_FILE_PATH):
        print(f'错误: 源文件不存在 - {MP4_FILE_PATH}')
        return

    conn = connect_dm()

    try:
        course_id, course_code, video_filename = insert_course(conn)
        verify_insertion(conn, course_id)

        print(f'\n===== 插入完成 =====')
        print(f'课程ID: {course_id}')
        print(f'课程编码: {course_code}')
        print(f'课程名称: {COURSE_NAME}')
        print(f'视频文件: {video_filename}')
        print(f'视频存放路径: {os.path.join(VIDEO_BASE_PATH, video_filename)}')
        print(f'API视频地址: /api/video/{video_filename}')
    except Exception as e:
        conn.rollback()
        print(f'错误: {e}')
        import traceback
        traceback.print_exc()
    finally:
        conn.close()
        print('数据库连接已关闭')

if __name__ == '__main__':
    main()
